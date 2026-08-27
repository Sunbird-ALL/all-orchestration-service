import { SignJWT } from "jose";
import { jwtDecode } from "jwt-decode";
import virtualId from "../../models/user";
import * as jose from 'jose';
import { createHash } from "crypto";
import HttpException from "../../../common/http.Exception/http.Exception";
import http from 'http';
import https from 'https';

const postJson = (urlStr: string, body: any): Promise<any> => {
    return new Promise((resolve, reject) => {
        try {
            const url = new URL(urlStr);
            const data = JSON.stringify(body);
            const transport = url.protocol === 'https:' ? https : http;
            const req = transport.request(
                url,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(data),
                    },
                },
                (res) => {
                    let responseBody = '';
                    res.on('data', (chunk) => {
                        responseBody += chunk;
                    });
                    res.on('end', () => {
                        try {
                            const parsed = JSON.parse(responseBody);
                            resolve(parsed);
                        } catch (e) {
                            resolve(null);
                        }
                    });
                },
            );
            req.on('error', (err) => reject(err));
            req.write(data);
            req.end();
        } catch (err) {
            reject(err);
        }
    });
};

function getEncryptionKey(): Uint8Array {
    const encKeyStr = process.env.JWT_ENCRYPTION_PRIVATE_KEY;
    if (encKeyStr) {
        return jose.base64url.decode(encKeyStr);
    }
    const secret_key = process.env.JOSE_SECRET || '';
    return createHash('sha256').update(secret_key).digest();
}

class virtualIdService {

    // MongoDB send virtual_id token
    static async generateId(username: any, next: CallableFunction) {
        try {
            const encryptionKey = getEncryptionKey();
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
                .encrypt(encryptionKey);

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
            const key = getEncryptionKey();

            // Decrypt the token and extract the payload
            const { payload } = await jose.jwtDecrypt(encryptedToken, key, {
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

            // Step 1: Get encryption key & decrypt token
            const key = getEncryptionKey();

            try {
                const jwtDecryptedToken = await jose.jwtDecrypt(token, key);
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

    static async tokenStatus(user_id: string, token: string) {
        const loginServiceUrl = process.env.AXL_LOGIN_SERVICE_URL || 'http://axl-login-service:8000';
        let activeToken: string | null = null;

        try {
            const statusData: any = await postJson(`${loginServiceUrl}/api/v1/virtualId/tokenStatus`, {
                user_id: Number(user_id) || user_id,
            });
            activeToken =
                statusData?.responseObj?.responseDataParams?.data?.token ??
                statusData?.data?.token ??
                statusData?.token ??
                null;
        } catch (fetchErr) {
            // Error calling remote service
        }

        if (!activeToken) {
            const user = await virtualId.findOne({
                virtualId: user_id,
            });
            if (user && user.token) {
                activeToken = user.token;
            }
        }

        return {
            isActive: Boolean(activeToken && activeToken === token)
        };
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

