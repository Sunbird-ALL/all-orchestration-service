import { SignJWT } from "jose";
import virtualId from "../../models/user";
import * as jose from 'jose';
import { createHash } from "crypto";
import redisClient from "../redisClient";
import HttpException from "../../../common/http.Exception/http.Exception";



class virtualIdService {

    // MongoDB send virtual_id token
    static async generateId(username: any, next: CallableFunction) {
        try {
            const secret_key = process.env.JOSE_SECRET || '';
            const hash = createHash('sha256').update(secret_key).digest();
            const lowercaseUsername = username.trim().toLowerCase();
            const existingUser = await virtualId.findOne({ userName: lowercaseUsername });

            let virtualID: number;
            if (existingUser) {
                virtualID = existingUser.virtualId;
            } else {
                virtualID = generateRandomID();
                const newUser = new virtualId({ userName: lowercaseUsername, virtualId: virtualID });
                await newUser.save();
            }

            // **Step 1: Sign the JWT Token**
            const jwtSigninKey = new TextEncoder().encode(process.env.JWT_SIGNIN_PRIVATE_KEY);
            const jwtSignedToken = await new jose.SignJWT({ virtual_id: virtualID })
                .setProtectedHeader({ alg: 'HS256' })
                .setExpirationTime('30m')
                .sign(jwtSigninKey);


            // **Step 2: Encrypt the Signed JWT Token**
            const jwtEncryptedToken = await new jose.EncryptJWT({ jwtSignedToken })
                .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
                .setExpirationTime('30m')
                .encrypt(hash);

            return next(null, {
                token: jwtEncryptedToken
            });
        } catch (err) {
            return next(err, "Something went wrong!");
        }
    }


    static async logout(token: string): Promise<{ success: boolean; message?: string }> {
        try {
            if (!token) {
                throw new HttpException(400, 'Token is required');
            }

            // Step 1: Verify token structure
            const secret_key = process.env.JOSE_SECRET;
            if (!secret_key) {
                throw new HttpException(500, 'Server configuration error');
            }

            const hash = createHash('sha256').update(secret_key).digest();

            // Step 2: Check if token is already blacklisted
            const isBlacklisted = await redisClient.get(`blacklist:${token}`);
            if (isBlacklisted) {
                return { success: true, message: 'Token was already logged out' };
            }

            // Step 3: Decrypt and verify token (with expiration tolerance)
            try {
                const jwtDecryptedToken = await jose.jwtDecrypt(token, hash);
                const jwtSignedToken = String(jwtDecryptedToken.payload.jwtSignedToken);

                const jwtSigninKey = new TextEncoder().encode(process.env.JWT_SIGNIN_PRIVATE_KEY);
                const verifiedToken = await jose.jwtVerify(jwtSignedToken, jwtSigninKey, {
                    clockTolerance: 300 // 5 minutes tolerance for clock skew
                });

                // Step 4: Calculate remaining TTL (30 minutes max from issuance)
                const currentTime = Math.floor(Date.now() / 1000);
                const tokenExp = verifiedToken.payload.exp || currentTime + 1800; // Default 30min if missing
                const ttl = tokenExp - currentTime;

                // Step 5: Blacklist token with remaining TTL
                await redisClient.set(`blacklist:${token}`, 'logged-out', {
                    EX: ttl > 0 ? ttl : 1800 // Minimum 30min if already expired
                });

                return { success: true };

            } catch (error) {
                // Handle expired tokens - still blacklist them for remaining buffer period
                if (error instanceof jose.errors.JWTExpired) {
                    await redisClient.set(`blacklist:${token}`, 'logged-out', {
                        EX: 300 // 5 minutes for expired tokens
                    });
                    return { success: true, message: 'Expired token was logged out' };
                }

                // For other JWT errors
                if (error instanceof jose.errors.JOSEError) {
                    throw new HttpException(401, 'Invalid token');
                }

                throw error;
            }

        } catch (error) {
            console.error('LogoutService error:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(500, 'Internal server error');
        }
    }


}
export default virtualIdService;

// function for generate random_id
function generateRandomID() {
    return Math.floor(1000000000 + Math.random() * 9000000000);
}

