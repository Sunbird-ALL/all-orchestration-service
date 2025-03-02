import { NextFunction, Request, Response } from "express";
import { getPointsByUserIdValidationSchema, addPointValidationSchema } from '../../validates/point.validate';
import pointerServices from "./point.services";
import HttpException from "../../../common/http.Exception/http.Exception";
import HttpResponse from "../../../common/http.Response/http.Response";


class pointerController {

    static async addPoint(request: Request, response: Response, next: CallableFunction) {
        try {
            const userId = response.locals.virtual_id.toString();
            const pointer = request.body;
            pointer.userId = userId;

            const { error } = addPointValidationSchema.validate({ userId, ...request.body });
            if (error) {
                response.status(400).send(new HttpResponse(null, null, "Required fields are missing", null));
            }
            else {
                pointerServices.addPoint(pointer, (err: any, result: any) => {
                    if (err) {
                        response.status(400).send(new HttpException(400, "Something went wrong"));
                    } else {
                        response.status(200).send(new HttpResponse(null, result, "Point added", null));
                    }
                });
            }
        }
        catch (err) {
            response.status(400).send(new HttpException(400, "Something went wrong"));
        }
    }

    // Get pointers
    static async getPointsByUserId(request: Request, response: Response, next: NextFunction) {
        try {
            const userId = response.locals.virtual_id.toString();
            const sessionId = request.params.sessionId;
            const language = request.query.language

            const { error } = getPointsByUserIdValidationSchema.validate({ userId: userId, sessionId, language });
            if (error) {
                response.status(400).send(new HttpResponse(null, null, "Required fields are missing", null));
            } else {
                pointerServices.getPointsByUserID(userId, sessionId, language, (err: any, result: any) => {
                    if (err) {
                        response.status(400).send(new HttpException(400, "Something went wrong"));
                    } else {
                        response.status(200).send(new HttpResponse("GetPointer", result, "Total pointer Returned", null));
                    }
                });
            }
        } catch (err) {
            response.status(400).send(new HttpException(400, "Something went wrong"));
        }
    }
}
export default pointerController;