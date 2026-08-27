import * as jose from 'jose';
import { Request, Response, NextFunction } from 'express';
import virtualId from '../models/user';
import HttpException from '../../common/http.Exception/http.Exception';

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

const verifyToken = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const encryptionKeyStr = process.env.JWT_ENCRYPTION_PRIVATE_KEY || '';
        const signinKeyStr = process.env.JWT_SIGNIN_PRIVATE_KEY || '';

        if (!encryptionKeyStr || !signinKeyStr) {
            return next(
                new HttpException(500, 'JWT keys configuration missing', {
                    errorType: 'ConfigurationError',
                    code: 'MISSING_JWT_KEYS',
                }),
            );
        }
        // 1. Decrypt JWE token using base64url-decoded JWT_ENCRYPTION_PRIVATE_KEY
        const jwtEncryptionKey = jose.base64url.decode(encryptionKeyStr);

        const authHeader = request.header('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(
                new HttpException(401, 'Invalid or missing token', {
                    errorType: 'AuthenticationError',
                    code: 'MISSING_BEARER_TOKEN',
                }),
            );
        }
        const token = authHeader.split(' ')[1];

        const jwtDecryptedToken = await jose.jwtDecrypt(token, jwtEncryptionKey);
        if (!jwtDecryptedToken.payload.jwtSignedToken) {
            return next(
                new HttpException(400, 'Invalid token payload: Missing jwtSignedToken', {
                    errorType: 'BadRequest',
                    code: 'INVALID_TOKEN_PAYLOAD',
                }),
            );
        }

        // 2. Verify inner JWS signature using UTF-8 encoded JWT_SIGNIN_PRIVATE_KEY
        const jwtSigninKey = new TextEncoder().encode(signinKeyStr);
        const jwtSignedToken = String(jwtDecryptedToken.payload.jwtSignedToken);
        const verifiedToken = await jose.jwtVerify(jwtSignedToken, jwtSigninKey);

        const { exp } = verifiedToken.payload;
        const virtual_id = (verifiedToken.payload as any).virtual_id || (verifiedToken.payload as any).virtualId;
        if (!exp || exp <= Math.floor(Date.now() / 1000)) {
            return next(
                new HttpException(401, 'Token expired', {
                    errorType: 'AuthenticationError',
                    code: 'TOKEN_EXPIRED',
                }),
            );
        }

        if (!virtual_id) {
            return next(
                new HttpException(400, 'Invalid token payload: Missing virtual_id', {
                    errorType: 'BadRequest',
                    code: 'MISSING_VIRTUAL_ID',
                }),
            );
        }

        // 3. Validate token status against axl-login-service tokenStatus API (or DB fallback)
        const loginServiceUrl = process.env.AXL_LOGIN_SERVICE_URL || 'http://localhost:8000';
        let activeToken: string | null = null;

        try {
            const statusData: any = await postJson(`${loginServiceUrl}/api/v1/virtualId/tokenStatus`, {
                user_id: virtual_id,
            });
            activeToken =
                statusData?.responseObj?.responseDataParams?.data?.token ??
                statusData?.data?.token ??
                statusData?.token ??
                null;
        } catch (fetchErr) {
            // Remote auth service call failed
        }

        // Fallback to local DB check if auth service did not return token
        if (!activeToken) {
            const token_status = await virtualId.findOne({
                virtualId: virtual_id,
            });
            if (token_status && token_status.token) {
                activeToken = token_status.token;
            }
        }

        if (!activeToken || activeToken !== token) {
            return next(
                new HttpException(401, 'User logged out', {
                    errorType: 'AuthenticationError',
                    code: 'TOKEN_REVOKED',
                }),
            );
        }
        response.locals.virtual_id = virtual_id;
        next();
    } catch (error) {
        if (error instanceof jose.errors.JWTExpired) {
            return next(
                new HttpException(401, 'Token expired', {
                    errorType: 'AuthenticationError',
                    code: 'TOKEN_EXPIRED',
                }),
            );
        }
        if (error instanceof jose.errors.JWSSignatureVerificationFailed) {
            return next(
                new HttpException(401, 'Invalid token signature', {
                    errorType: 'AuthenticationError',
                    code: 'INVALID_SIGNATURE',
                }),
            );
        }
        return next(
            new HttpException(400, 'Invalid token', {
                errorType: 'AuthenticationError',
                code: 'INVALID_TOKEN',
            }),
        );
    }
};
export default verifyToken;
