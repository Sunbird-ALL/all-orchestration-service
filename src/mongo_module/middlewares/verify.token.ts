import * as jose from 'jose';
import { Request, Response, NextFunction } from 'express';
import HttpException from '../../common/http.Exception/http.Exception';
import { getActiveTokenByUserId, getEncryptionKey, getSigningKey } from '../../common/authHelper';

const verifyToken = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const encryptionKeyStr = process.env.JOSE_ENCRYPTION_PRIVATE_KEY || process.env.JOSE_SECRET || '';
        const signinKeyStr = process.env.JOSE_SIGNIN_PRIVATE_KEY || '';

        if (!encryptionKeyStr || !signinKeyStr) {
            return next(
                new HttpException(500, 'Secret key is missing', {
                    errorType: 'ConfigurationError',
                    code: 'MISSING_JOSE_SECRET',
                }),
            );
        }
        // 1. Decrypt JWE token using shared encryption key
        const jwtEncryptionKey = getEncryptionKey();

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

        // 2. Verify inner JWS signature using UTF-8 encoded JOSE_SIGNIN_PRIVATE_KEY
        const jwtSigninKey = getSigningKey();
        const jwtSignedToken = String(jwtDecryptedToken.payload.jwtSignedToken);
        const verifiedToken = await jose.jwtVerify(jwtSignedToken, jwtSigninKey);

        const { exp, virtualId } = verifiedToken.payload;
        if (!exp || exp <= Math.floor(Date.now() / 1000)) {
            return next(
                new HttpException(401, 'Token expired', {
                    errorType: 'AuthenticationError',
                    code: 'TOKEN_EXPIRED',
                }),
            );
        }

        if (!virtualId || typeof virtualId !== 'string' || 'number') {
            return next(
                new HttpException(400, 'Invalid token payload: Missing virtual_id', {
                    errorType: 'BadRequest',
                    code: 'MISSING_VIRTUAL_ID',
                }),
            );
        }

        // 3. Validate token status against axl-login-service tokenStatus API (or DB fallback)
        const activeToken = await getActiveTokenByUserId(virtualId);

        if (!activeToken || activeToken !== token) {
            return next(
                new HttpException(401, 'User logged out', {
                    errorType: 'AuthenticationError',
                    code: 'TOKEN_REVOKED',
                }),
            );
        }
        response.locals.virtual_id = virtualId;
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
