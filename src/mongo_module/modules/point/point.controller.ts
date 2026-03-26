import { NextFunction, Request, Response } from "express";
import { getPointsByUserIdValidationSchema, addPointValidationSchema } from '../../validates/point.validate';
import pointerServices from "./point.services";
import HttpException from "../../../common/http.Exception/http.Exception";
import HttpResponse from "../../../common/http.Response/http.Response";
import { toHttpException } from "../../../common/middleware/api-error.middleware";


class pointerController {

    static async addPoint(request: Request, response: Response, next: NextFunction) {
        try {
            const userId = response.locals.virtual_id.toString();
            const pointer = request.body;
            pointer.userId = userId;

            const { error } = addPointValidationSchema.validate({ userId, ...request.body });
            if (error) {
                return next(HttpException.fromJoi(error));
            }
            pointerServices.addPoint(pointer, (err: any, result: any) => {
                if (err) {
                    return next(new HttpException(400, "Something went wrong", { code: 'POINT_ADD_FAILED' }));
                }
                response.status(200).send(new HttpResponse(null, result, "Point added", null));
            });
        }
        catch (err) {
            next(toHttpException(err));
        }
    }

    static async getPointsByUserId(request: Request, response: Response, next: NextFunction) {
        try {
            const userID = response.locals.virtual_id.toString();
            const sessionID = request.params.sessionId;
            const language = request.query.language;

            const { error } = getPointsByUserIdValidationSchema.validate({ userId: userID, ...request.params, ...request.query });
            if (error) {
                return next(HttpException.fromJoi(error));
            }
            pointerServices.getPointsByUserID(userID, sessionID, language, (err: any, result: any) => {
                if (err) {
                    return next(new HttpException(400, "Something went wrong", { code: 'POINT_GET_FAILED' }));
                }
                response.status(200).send(new HttpResponse("GetPointer", result, "Total pointer Returned", null));
            });
        } catch (err) {
            next(toHttpException(err));
        }
    }
}
export default pointerController;
