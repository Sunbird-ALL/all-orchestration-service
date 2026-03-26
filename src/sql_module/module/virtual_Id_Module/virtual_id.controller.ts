import { NextFunction, Request, Response } from "express";
import HttpException from "../../../common/http.Exception/http.Exception";
import HttpResponse from "../../../common/http.Response/http.Response";
import virtualIdSqlSqlService from "./virtual_id.service";
import { toHttpException } from "../../../common/middleware/api-error.middleware";


class virtualIdSqlController {

    static async genarateVirtualId(request: Request, response: Response, next: NextFunction) {
        try {
            const username = request.query.username;
            if (!username) {
                return next(new HttpException(400, "Username is required", { code: 'MISSING_USERNAME' }));
            }
            virtualIdSqlSqlService.genarateId(username, (err: any, result: any) => {
                if (err) {
                    return next(new HttpException(400, "Something went wrong", { code: 'SQL_VIRTUAL_ID_FAILED' }));
                }
                response.status(200).send(new HttpResponse(null, result, "Virtual_id generated", null));
            });
        }
        catch (err) {
            next(toHttpException(err));
        }
    }
}
export default virtualIdSqlController;
