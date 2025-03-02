import * as jose from 'jose';
import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';
import decryptToken from '../../common/token/tokenCommen';

const verifyToken = async (request: Request, response: Response, next: NextFunction) => {
    try {
        return decryptToken(request, response, next);
    } catch (error) {
        return response.status(500).json({ status: 500, error: "Somethning wrong" }); 
    }
};
export default verifyToken;
