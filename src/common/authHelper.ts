import http from 'node:http';
import https from 'node:https';
import { createHash } from 'node:crypto';
import * as jose from 'jose';
import virtualId from '../mongo_module/models/user';

export const getEncryptionKey = (): Uint8Array => {
    const encKeyStr = process.env.JOSE_ENCRYPTION_PRIVATE_KEY;
    if (encKeyStr) {
        return jose.base64url.decode(encKeyStr);
    }
    const secret_key = process.env.JOSE_SECRET || '';
    return createHash('sha256').update(secret_key).digest();
};

export const getSigningKey = (): Uint8Array => {
    const signinKeyStr = process.env.JOSE_SIGNIN_PRIVATE_KEY || '';
    return new TextEncoder().encode(signinKeyStr);
};

const AUTH_SERVICE_TIMEOUT_MS = Number(process.env.AXL_LOGIN_SERVICE_TIMEOUT_MS) || 5000;

export class AuthServiceUnavailableError extends Error {
    constructor(message: string, public readonly cause?: unknown) {
        super(message);
        this.name = 'AuthServiceUnavailableError';
    }
}

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
                    timeout: AUTH_SERVICE_TIMEOUT_MS,
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
                            reject(new AuthServiceUnavailableError('Auth service returned an invalid response', parseErr));
                        }
                    });
                },
            );
            req.on('timeout', () => {
                req.destroy(new AuthServiceUnavailableError(`Auth service request timed out after ${AUTH_SERVICE_TIMEOUT_MS}ms`));
            });
            req.on('error', (err) => {
                console.error('HTTP request error to auth service:', err.message);
                reject(new AuthServiceUnavailableError('Auth service is unreachable', err));
            });
            req.write(data);
            req.end();
        } catch (err) {
            console.error('Invalid URL or request setup:', err);
            reject(new AuthServiceUnavailableError('Auth service request could not be constructed', err));
        }
    });
};

export const getActiveTokenByUserId = async (
    userId: number | string,
    token?: string,
): Promise<{ activeToken: string | null; authServiceUnavailable: boolean }> => {
    const loginServiceUrl = process.env.AXL_LOGIN_SERVICE_URL;
    let activeToken: string | null = null;
    let authServiceUnavailable = false;

    if (loginServiceUrl) {
        try {
            const statusData: any = await postJson(loginServiceUrl, {
                user_id: Number(userId) || userId,
                token,
            });
            const isActive =
                statusData?.responseObj?.responseDataParams?.data?.isActive ??
                statusData?.data?.isActive ??
                statusData?.isActive ??
                false;
            activeToken = isActive ? (token ?? null) : null;
        } catch (fetchErr) {
            console.error('Error fetching token status from auth service:', fetchErr);
            authServiceUnavailable = fetchErr instanceof AuthServiceUnavailableError;
        }
    } else {
        console.error('AXL_LOGIN_SERVICE_URL is not configured; skipping remote token status check');
        authServiceUnavailable = true;
    }

    if (!activeToken) {
        const user = await virtualId.findOne({
            virtualId: Number(userId) || userId,
        });
        if (user?.token) {
            activeToken = user.token;
        }
    }

    return { activeToken, authServiceUnavailable };
};
