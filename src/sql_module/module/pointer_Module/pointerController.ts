import { Request, Response } from "express";
import HttpException from "../../../common/http.Exception/http.Exception";
import HttpResponse from "../../../common/http.Response/http.Response";
import pointerSqlService from "./pointerScrvice";

class pointerController {

    static async addPointer(request: Request, response: Response, next: CallableFunction) {
        try {
            const pointer = request.body;
            pointerSqlService.addPointer(pointer, (err: any, result: any) => {
                if (err) {
                    next(new HttpException(400, "Something went wrong"));
                } else {
                    response.status(200).send(new HttpResponse(null, result, "Pointer added", null));
                }
            });
        }
        catch (err) {
            next(new HttpException(400, "Something went wrong"));
        }
    }

    static async getPointersByUserId(request: Request, response: Response, next: CallableFunction) {
        try {
            const userID = request.params.userId;
            const sessionID = request.params.sessionId;
            const language = request.query.language
            if (userID == "null") {
                response.status(400).send(new HttpResponse(null, null, "userId is not be null", null));
            }
            else if (sessionID == "null") {
                response.status(400).send(new HttpResponse(null, null, "sessionId is not be null", null));
            }
            else if (language == "null") {
                response.status(400).send(new HttpResponse(null, null, "language is not be null", null));
            } else {
                pointerSqlService.getPointersByUserID(userID, sessionID, language, (err: any, result: any) => {
                    if (err) {
                        next(new HttpException(400, "Something went wrong"));
                    } else {
                        response.status(200).send(new HttpResponse("GetPointer", result, "Total pointer Returned", null));
                    }
                });
            }
        } catch (err) {
            console.log(err);
            next(new HttpException(400, "Something went wrong"));
        }
    }
}
export default pointerController;