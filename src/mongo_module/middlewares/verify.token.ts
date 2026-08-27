import * as jose from 'jose';
import { Request, Response, NextFunction } from 'express';
import HttpException from '../../common/http.Exception/http.Exception';
import { getActiveTokenByUserId } from '../../common/authHelper';

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
        const activeToken = await getActiveTokenByUserId(virtual_id);

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
