import * as jose from 'jose';
import { Request, Response, NextFunction } from 'express';
import HttpException from "../../common/http.Exception/http.Exception";


const verifyToken = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const secretKeyString = process.env.JOSE_SECRET?.trim();
        if (!secretKeyString) {
            return response.status(400).send(new HttpException(400, "secret key is missing"));
        }

        let token = request.header('Authorization');
        if (!token) {
            return response.status(400).send(new HttpException(400, "Authorization header is missing"));
        }

        if (token && token.startsWith('Bearer ')) {
            token = token.split(' ')[1];
        } else {
            return response.status(400).send(new HttpException(400, "Invalid token format"));
        }

        const secretKey = new TextEncoder().encode(secretKeyString);
        const signedToken = await jose.jwtVerify(token, secretKey);

        const currentTime = Math.floor(Date.now() / 1000);
        const expirationTime = signedToken.payload.exp;

        if (!expirationTime || expirationTime <= currentTime) {
            return response.status(401).send(new HttpException(401, "Invalid Token"));
        }

        response.locals.virtual_id = signedToken.payload.virtual_id;
        next();
    } catch (error) {
        const err = error as Error;
        if (
            err.message === 'Invalid Compact JWS' ||
            err.message === '"exp" claim timestamp check failed' ||
            err.message === 'signature verification failed'
        ) {
            return response.status(401).send(new HttpException(401, "Invalid Token"));
        } else {
            return response.status(400).send(new HttpException(400, "Something went wrong"));
        }
    };
}

export default verifyToken;
