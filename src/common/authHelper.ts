import http from 'node:http';
import https from 'node:https';
import { createHash } from 'node:crypto';
import * as jose from 'jose';
import virtualId from '../mongo_module/models/user';

export const getEncryptionKey = (): Uint8Array => {
    const encKeyStr = process.env.JWT_ENCRYPTION_PRIVATE_KEY;
    if (encKeyStr) {
        return jose.base64url.decode(encKeyStr);
    }
    const secret_key = process.env.JOSE_SECRET || '';
    return createHash('sha256').update(secret_key).digest();
};

export const getSigningKey = (): Uint8Array => {
    const signinKeyStr = process.env.JWT_SIGNIN_PRIVATE_KEY || '';
    return new TextEncoder().encode(signinKeyStr);
};

export const postJson = <T = any>(urlStr: string, body: unknown): Promise<T | null> => {
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
                        } catch (parseErr) {
                            console.error('Failed to parse JSON response from auth service:', parseErr);
                            reject(parseErr);
                        }
                    });
                },
            );
            req.on('error', (err) => {
                console.error('HTTP request error to auth service:', err.message);
                reject(err);
            });
            req.write(data);
            req.end();
        } catch (err) {
            console.error('Invalid URL or request setup:', err);
            reject(err);
        }
    });
};

export const getActiveTokenByUserId = async (userId: number | string): Promise<string | null> => {
    const loginServiceUrl = process.env.AXL_LOGIN_SERVICE_URL;
    let activeToken: string | null = null;

    if (loginServiceUrl) {
        try {
            const statusData: any = await postJson(`${loginServiceUrl}/api/v1/virtualId/tokenStatus`, {
                user_id: Number(userId) || userId,
            });
            activeToken =
                statusData?.responseObj?.responseDataParams?.data?.token ??
                statusData?.data?.token ??
                statusData?.token ??
                null;
        } catch (fetchErr) {
            console.error('Error fetching token status from auth service:', fetchErr);
        }
    }

    if (!activeToken) {
        const user = await virtualId.findOne({
            virtualId: Number(userId) || userId,
        });
        if (user?.token) {
            activeToken = user.token;
        }
    }

    return activeToken;
};
