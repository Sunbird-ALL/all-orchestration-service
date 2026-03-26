import * as jose from 'jose';
import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';
import virtualId from '../models/user';
import HttpException from '../../common/http.Exception/http.Exception';

const verifyToken = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const secret_key = process.env.JOSE_SECRET || '';

        if (!secret_key) {
            return next(
                new HttpException(500, 'Secret key is missing', {
                    errorType: 'ConfigurationError',
                    code: 'MISSING_JOSE_SECRET',
                }),
            );
        }
        const hash = createHash('sha256').update(secret_key).digest();

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

        const jwtDecryptedToken = await jose.jwtDecrypt(token, hash);
        if (!jwtDecryptedToken.payload.jwtSignedToken) {
            return next(
                new HttpException(400, 'Invalid token payload: Missing jwtSignedToken', {
                    errorType: 'BadRequest',
                    code: 'INVALID_TOKEN_PAYLOAD',
                }),
            );
        }

        const jwtSigninKey = new TextEncoder().encode(process.env.JWT_SIGNIN_PRIVATE_KEY || '');
        const jwtSignedToken = String(jwtDecryptedToken.payload.jwtSignedToken);
        const verifiedToken = await jose.jwtVerify(jwtSignedToken, jwtSigninKey);

        const { exp, virtual_id } = verifiedToken.payload;
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

        const token_status = await virtualId.findOne({
            virtualId: virtual_id,
        });

        if (!token_status || token_status.token == null || token_status.token !== token) {
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
