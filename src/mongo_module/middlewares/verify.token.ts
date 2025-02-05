import * as jose from 'jose';
import { Request, Response, NextFunction } from 'express';

const verifyToken = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const secretKeyString = process.env.JOSE_SECRET
        if (!secretKeyString) {
            console.error("Secret key is missing");
            return response.status(500).json({ status: 500, error: "Server error: Secret key is missing" });
        }

        const authHeader = request.header('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return response.status(401).json({ status: 401, error: "Invalid or missing token" });
        }
        const token = authHeader.split(' ')[1];
        const secretKey = new TextEncoder().encode(secretKeyString);
        const signedToken = await jose.jwtVerify(token, secretKey);
        const { exp, virtual_id } = signedToken.payload;

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
};
export default verifyToken;
