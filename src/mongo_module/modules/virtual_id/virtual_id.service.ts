import { SignJWT } from "jose";
import { jwtDecode } from "jwt-decode";
import virtualId from "../../models/user";
import * as jose from 'jose';
import { createHash } from "crypto";
import HttpException from "../../../common/http.Exception/http.Exception";

class virtualIdService {

    // MongoDB send virtual_id token
    static async generateId(username: any, next: CallableFunction) {
        try {
            const secret_key = process.env.JOSE_SECRET || '';
            const hash = createHash('sha256').update(secret_key).digest();
            const lowercaseUsername = username.trim().toLowerCase();
            const existingUser = await virtualId.findOne({ userName: lowercaseUsername });
            const token_exp_time = process.env.JWT_EXPIRATION || '1h'

            let virtualID = existingUser ? existingUser.virtualId : generateRandomID();
            console.log("virtualId----", virtualID);

            // **Step 1: Sign the JWT Token**
            const jwtSigninKey = new TextEncoder().encode(process.env.JWT_SIGNIN_PRIVATE_KEY);
            const jwtSignedToken = await new jose.SignJWT({ virtual_id: virtualID })
                .setProtectedHeader({ alg: 'HS256' })
                .setExpirationTime(token_exp_time)
                .sign(jwtSigninKey);


            // **Step 2: Encrypt the Signed JWT Token**
            const jwtEncryptedToken = await new jose.EncryptJWT({ jwtSignedToken })
                .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
                .setExpirationTime(token_exp_time)
                .encrypt(hash);

            if (existingUser) {
              await virtualId.updateOne(
                { virtualId: virtualID },
                {
                  $set: {
                    token: jwtEncryptedToken,
                  },
                }
              );
            } else {
              const newUser = new virtualId({
                userName: lowercaseUsername,
                virtualId: virtualID,
                token: jwtEncryptedToken,
              });
              await newUser.save();
            }
            
            return next(null, {
                token: jwtEncryptedToken
            });
        } catch (err) {
            return next(err, "Something went wrong!");
        }
    }

    // Decode JOSE token and extract virtual ID
    static async decodeToken(encryptedToken: string): Promise<{ virtual_id: string; success: boolean; error?: string }> {
        try {
            const secret = process.env.JOSE_SECRET;
            if (!secret) {
                throw new Error('JOSE_SECRET environment variable is not set');
            }

            // Generate a 32-byte key from your secret (SHA-256)
            const key = createHash('sha256').update(secret).digest();

            // Decrypt the token and extract the payload
            const { payload, protectedHeader } = await jose.jwtDecrypt(encryptedToken, key, {
                clockTolerance: 60 * 60 * 24 * 365,  // 1 year tolerance
                maxTokenAge: undefined              // disable age-based rejection
            });

            // Extract the JWT signed token from the payload
            const jwtSignedToken = String(payload.jwtSignedToken);

            const decoded: any = jwtDecode(jwtSignedToken);

            return {
                'virtual_id': decoded.virtual_id,
                success: true
            };
        } catch (err: any) {
            console.error('Token decoding error:', err.message);
            return {
                virtual_id: '',
                success: false,
                error: err.message
            };
        }
    }

    static async logout(token: string): Promise<{ success: boolean; message?: string }> {
        console.log("logout service: start");
        try {
            console.log("logout service: line 1");
            if (!token) {
                console.log("logout service: line 2 - token missing");
                throw new HttpException(400, 'Token is required');
            }

            console.log("logout service: line 3");
            // Step 1: Verify token structure
            const secret_key = process.env.JOSE_SECRET;
            console.log("logout service: line 4, secret_key exists:", !!secret_key);
            if (!secret_key) {
                console.log("logout service: line 5 - secret_key missing");
                throw new HttpException(500, 'Server configuration error');
            }
            console.log("logout service: line 6");
            const hash = createHash('sha256').update(secret_key).digest();

            // Step 2: Decrypt and verify token (with expiration tolerance)
            try {
                console.log("logout service: line 7 - decrypting token");
                const jwtDecryptedToken = await jose.jwtDecrypt(token, hash);
                console.log("logout service: line 8 - token decrypted");
                const jwtSignedToken = String(jwtDecryptedToken.payload.jwtSignedToken);
                console.log("logout service: line 9");

                const jwtSigninKey = new TextEncoder().encode(process.env.JWT_SIGNIN_PRIVATE_KEY);
                console.log("logout service: line 10 - verifying token");
                const verifiedToken = await jose.jwtVerify(jwtSignedToken, jwtSigninKey, {
                    clockTolerance: 300 // 5 minutes tolerance for clock skew
                });
                console.log("logout service: line 11 - token verified");

                console.log("logout service: line 12");
                const virtualID = verifiedToken.payload.virtual_id;
                console.log("logout service: line 13, virtualID:", virtualID, "type:", typeof virtualID);
                console.log("logout service: line 14 - querying database");
                const user = await virtualId.findOne({
                  virtualId: virtualID,
                }).maxTimeMS(5000);
                console.log("logout service: line 15, user found:", !!user);
                console.log("logout service: line 16, user virtualId:", user?.virtualId);
                console.log("logout service: line 17, user token matches:", user?.token === token);

                if (!user || user.token !== token) {
                    console.log("logout service: line 18 - user not found or token mismatch");
                    console.log("logout service: user exists:", !!user);
                    console.log("logout service: token matches:", user?.token === token);
                    throw new HttpException(404, 'User not found');
                }

                console.log("logout service: line 19 - updating database");
                // Step 3: Update DB: set isLoggedIn = false,
                await virtualId.updateOne(
                    { virtualId: virtualID },
                    {
                        $set: {
                            token: null,
                        }
                    }
                ).maxTimeMS(5000);
                console.log("logout service: line 20 - update completed");
                return { success: true, message: 'Logout successful' };
            } catch (error) {
                console.log("logout service: inner catch, error:", error);
                if (error instanceof jose.errors.JWTExpired) {
                    console.log("logout service: JWT expired");
                    return { success: true, message: 'Token was already expired' };
                }

                if (error instanceof jose.errors.JOSEError) {
                    console.log("logout service: JOSE error");
                    throw new HttpException(401, 'Invalid token');
                }
                console.log("logout service: rethrowing error");
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

    static async tokenStatus(user_id: string) {
        console.log("tokenStatus service: start");
        console.log("tokenStatus service: line 1, user_id:", user_id);
        const user = await virtualId.findOne({
            virtualId: Number(user_id),
        }).maxTimeMS(5000);
        console.log("tokenStatus service: line 2, user found:", !!user);
        console.log("tokenStatus service: line 3, returning result");
        return {
            token: user?.token
        };
    }
}
export default virtualIdService;

// function for generate random_id
function generateRandomID() {
    return Math.floor(1000000000 + Math.random() * 9000000000);
}

