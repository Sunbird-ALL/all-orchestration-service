import { NextFunction, Request, Response } from "express";
import HttpException from "../../../common/http.Exception/http.Exception";
import HttpResponse from "../../../common/http.Response/http.Response";
import pointerSqlService from "./pointerScrvice";
import { toHttpException } from "../../../common/middleware/api-error.middleware";

class pointerController {

    static async addPointer(request: Request, response: Response, next: NextFunction) {
        try {
            const pointer = request.body;
            pointerSqlService.addPointer(pointer, (err: any, result: any) => {
                if (err) {
                    return next(new HttpException(400, "Something went wrong", { code: 'SQL_POINTER_ADD_FAILED' }));
                }
                response.status(200).send(new HttpResponse(null, result, "Pointer added", null));
            });
        }
        catch (err) {
            next(toHttpException(err));
        }
    }

    static async getPointersByUserId(request: Request, response: Response, next: NextFunction) {
        try {
            const userID = request.params.userId;
            const sessionID = request.params.sessionId;
            const language = request.query.language;
            if (userID == "null") {
                return next(new HttpException(400, "userId must not be null", { code: 'INVALID_USER_ID' }));
            }
            if (sessionID == "null") {
                return next(new HttpException(400, "sessionId must not be null", { code: 'INVALID_SESSION_ID' }));
            }
            if (language == "null") {
                return next(new HttpException(400, "language must not be null", { code: 'INVALID_LANGUAGE' }));
            }
            pointerSqlService.getPointersByUserID(userID, sessionID, language, (err: any, result: any) => {
                if (err) {
                    return next(new HttpException(400, "Something went wrong", { code: 'SQL_POINTER_GET_FAILED' }));
                }
                response.status(200).send(new HttpResponse("GetPointer", result, "Total pointer Returned", null));
            });
        } catch (err) {
            next(toHttpException(err));
        }
    }
}
export default pointerController;
