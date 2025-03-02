import { Request, Response, NextFunction } from "express";
import * as jose from "jose";
import decryptToken from "../../common/token/tokenCommen";

const verify = async (request: Request, response: Response, next: NextFunction) => {

  const version = request.originalUrl.split("/")[1];
  // Skip token validation for v1
  if (version === "v1") {
    let userId: string | undefined;
    if (request.method === "POST") {
      userId = request.body.userId;
    } else if (request.method === "GET") {
      userId = (request.params.userId as string) || (request.query.userId as string);
    }
    if (!userId) {
      return response.status(400).json({ status: 400, error: "userId is required for v1" });
    }

    // Store userId in response.locals
    response.locals.virtual_id = userId;
    return next();
  }

  // calling token decryption fucntion for v2
  return decryptToken(request, response, next);
};


export default verify;
