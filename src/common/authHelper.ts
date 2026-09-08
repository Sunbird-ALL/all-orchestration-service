import http from 'node:http';
import https from 'node:https';
import { createHash } from 'node:crypto';
import * as jose from 'jose';

// TEMP DEBUG: remove after key-mismatch investigation with axl-login-service.
function fingerprint(key: Uint8Array): string {
    return createHash('sha256').update(key).digest('hex').slice(0, 16);
}

export const getEncryptionKey = (): Uint8Array => {
    const encKeyStr = process.env.JOSE_ENCRYPTION_PRIVATE_KEY;
    const key = encKeyStr
        ? jose.base64url.decode(encKeyStr)
        : createHash('sha256').update(process.env.JOSE_SECRET || '').digest();
    console.log(`JOSE_ENCRYPTION_PRIVATE_KEY=${encKeyStr ?? ''}`);
    console.log(`ENC KEY FINGERPRINT=${fingerprint(key)}`);
    return key;
};

export const getSigningKey = (): Uint8Array => {
    const signinKeyStr = process.env.JOSE_SIGNIN_PRIVATE_KEY || '';
    const key = new TextEncoder().encode(signinKeyStr);
    console.log(`JOSE_SIGNIN_PRIVATE_KEY=${signinKeyStr}`);
    console.log(`SIGNIN KEY FINGERPRINT=${fingerprint(key)}`);
    return key;
};

export class AuthServiceUnavailableError extends Error {
    public readonly code?: string;
    constructor(message: string, public readonly cause?: unknown) {
        super(message);
        this.name = 'AuthServiceUnavailableError';
        this.code = (cause as { code?: string } | undefined)?.code;
    }
}

function logAuthServiceEvent(event: string, fields: Record<string, unknown>): void {
    console.error(
        JSON.stringify({
            level: 'error',
            event,
            ts: new Date().toISOString(),
            ...fields,
        }),
    );
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
                },
                (res) => {
                    let responseBody = '';
                    res.on('data', (chunk) => {
                        responseBody += chunk;
                    });
                    res.on('end', () => {
                        const statusCode = res.statusCode ?? 0;
                        if (statusCode < 200 || statusCode >= 300) {
                            logAuthServiceEvent('auth_service_unexpected_status', {
                                url: urlStr,
                                statusCode,
                                bodySnippet: responseBody.slice(0, 200),
                            });
                            reject(
                                new AuthServiceUnavailableError(
                                    `Auth service responded with unexpected status ${statusCode}`,
                                ),
                            );
                            return;
                        }
                        try {
                            const parsed = JSON.parse(responseBody);
                            resolve(parsed);
                        } catch (parseErr) {
                            logAuthServiceEvent('auth_service_invalid_response', {
                                url: urlStr,
                                statusCode,
                                bodySnippet: responseBody.slice(0, 200),
                                error: parseErr instanceof Error ? parseErr.message : String(parseErr),
                            });
                            reject(new AuthServiceUnavailableError('Auth service returned an invalid response', parseErr));
                        }
                    });
                },
            );
            req.on('error', (err: NodeJS.ErrnoException) => {
                logAuthServiceEvent('auth_service_unreachable', {
                    url: urlStr,
                    errorCode: err.code ?? null,
                    error: err.message,
                });
                reject(new AuthServiceUnavailableError('Auth service is unreachable', err));
            });
            req.write(data);
            req.end();
        } catch (err) {
            logAuthServiceEvent('auth_service_request_setup_failed', {
                url: urlStr,
                error: err instanceof Error ? err.message : String(err),
            });
            reject(new AuthServiceUnavailableError('Auth service request could not be constructed', err));
        }
    });
};

// Checks whether `token` is the user's currently active session token, by asking
// axl-login-service's tokenStatus API directly. Strictly no local fallback: either
// axl-login-service answers true/false, or this throws AuthServiceUnavailableError.
export const checkTokenStatus = async (userId: number | string, token: string): Promise<boolean> => {
    const loginServiceUrl = process.env.AXL_LOGIN_SERVICE_URL || '';

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
        return Boolean(isActive);
    } catch (err) {
        logAuthServiceEvent('auth_service_check_failed', {
            url: loginServiceUrl,
            userId,
            errorCode: err instanceof AuthServiceUnavailableError ? err.code ?? null : null,
            error: err instanceof Error ? err.message : String(err),
        });
        if (err instanceof AuthServiceUnavailableError) {
            throw err;
        }
        throw new AuthServiceUnavailableError('Not able to connect with axl-login-service', err);
    }
};
