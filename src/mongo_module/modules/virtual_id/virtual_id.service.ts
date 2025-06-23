import { SignJWT } from "jose";
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

            let virtualID = existingUser ? existingUser.virtualId : generateRandomID();

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

            // Step 2: Decrypt and verify token (with expiration tolerance)
            try {
                const jwtDecryptedToken = await jose.jwtDecrypt(token, hash);
                const jwtSignedToken = String(jwtDecryptedToken.payload.jwtSignedToken);

                const jwtSigninKey = new TextEncoder().encode(process.env.JWT_SIGNIN_PRIVATE_KEY);
                const verifiedToken = await jose.jwtVerify(jwtSignedToken, jwtSigninKey, {
                    clockTolerance: 300 // 5 minutes tolerance for clock skew
                });

                const virtualID = verifiedToken.payload.virtual_id;
                const user = await virtualId.findOne({
                  virtualId: virtualID,
                });

                if (!user || user.token !== token) {
                    throw new HttpException(404, 'User not found');
                }

                // Step 3: Update DB: set isLoggedIn = false,
                await virtualId.updateOne(
                    { virtualId: virtualID },
                    {
                        $set: {
                            token: null,
                        }
                    }
                );
                return { success: true, message: 'Logout successful' };
            } catch (error) {
                if (error instanceof jose.errors.JWTExpired) {
                    return { success: true, message: 'Token was already expired' };
                }

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

    static async tokenStatus(user_id: string) {
        const user = await virtualId.findOne({
            virtualId: user_id,
        });

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

