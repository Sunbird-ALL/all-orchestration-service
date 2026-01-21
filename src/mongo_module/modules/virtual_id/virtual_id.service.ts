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

            let virtualID: number;
            if (existingUser && existingUser.virtualId) {
                virtualID = existingUser.virtualId;
            } else {
                virtualID = await generateUniqueVirtualID();
            }

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
                { userName: lowercaseUsername },
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

    static async deleteByUserName(username: string): Promise<{ success: boolean; message?: string }> {
        try {
            const lowercaseUsername = username.trim().toLowerCase();
            
            const existingUser = await virtualId.findOne({ userName: lowercaseUsername }).maxTimeMS(5000);
            
            if (!existingUser) {
                return { success: false, message: 'User not found' };
            }

            const deleteResult = await virtualId.deleteOne({ userName: lowercaseUsername }).maxTimeMS(5000);
            
            if (deleteResult.deletedCount > 0) {
                return { success: true, message: 'User deleted successfully' };
            } else {
                return { success: false, message: 'Failed to delete user' };
            }
        } catch (error: any) {
            throw new Error(error?.message || 'Failed to delete user');
        }
    }
}
export default virtualIdService;

// function for generate random_id
function generateRandomID() {
    return Math.floor(1000000000 + Math.random() * 9000000000);
}

// function to generate unique virtual_id
async function generateUniqueVirtualID(): Promise<number> {
    let virtualID: number;
    do {
        virtualID = generateRandomID();
    } while (await virtualId.findOne({ virtualId: virtualID }));
    return virtualID;
}

