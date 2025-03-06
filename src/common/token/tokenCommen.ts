import { createHash } from "crypto";
import { Request, Response, NextFunction } from 'express';
import * as jose from "jose"


const decryptToken = async (request: Request, response: Response, next: NextFunction) => {
    try {
        //Step 1: Load & Validate Secret Key
        const secret_key = process.env.JOSE_SECRET || '';
        if (!secret_key) {
            return response.status(500).json({ status: 500, error: "Secret key is missing" });
        }
        const hash = createHash('sha256').update(secret_key).digest();

        //Step 2: Extract Token from Header
        const authHeader = request.header('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return response.status(401).json({ status: 401, error: "Invalid or missing token" });
        }
        const token = authHeader.split(' ')[1];

        //Step 3: Decrypt the Encrypted Token
        const jwtDecryptedToken = await jose.jwtDecrypt(token, hash);
        if (!jwtDecryptedToken.payload.jwtSignedToken) {
            return response.status(400).json({ status: 400, error: "Invalid token payload: Missing jwtSignedToken" });
        }

        //Step 4: Verify the Signed JWT
        const jwtSigninKey = new TextEncoder().encode(process.env.JWT_SIGNIN_PRIVATE_KEY || '');
        const jwtSignedToken = String(jwtDecryptedToken.payload.jwtSignedToken);
        const verifiedToken = await jose.jwtVerify(jwtSignedToken, jwtSigninKey);

        //Step 5: Check Expiration
        const { exp, virtual_id } = verifiedToken.payload;
        if (!exp || exp <= Math.floor(Date.now() / 1000)) {
            return response.status(401).json({ status: 401, error: "Token expired" });
        }
        if (!virtual_id) {
            return response.status(400).json({ status: 400, error: "Invalid token payload: Missing virtual_id" });
        }
        response.locals.virtual_id = virtual_id;
        next();
        
    } catch (error) {
        if (error instanceof jose.errors.JWTExpired) {
            return response.status(401).json({ status: 401, error: "Token expired" });
        } else if (error instanceof jose.errors.JWSSignatureVerificationFailed) {
            return response.status(401).json({ status: 401, error: "Invalid token signature" });
        }
        return response.status(400).json({ status: 400, error: "Invalid token" });
    }
}

export default decryptToken;