import { Request, Response } from "express";
import HttpException from "../../../common/http.Exception/http.Exception";
import HttpResponse from "../../../common/http.Response/http.Response";
import virtualIdSqlSqlService from "./virtual_id.service";


class virtualIdSqlController {

    static async genarateVirtualId(request: Request, response: Response, next: CallableFunction) {
        try {
            const username = request.query.username;
            if (!username) {
                response.status(400).send(new HttpException(400, "Username and password are required"));
            }
            virtualIdSqlSqlService.genarateId(username,(err: any, result: any) => {
                if (err) {
                    response.status(400).send(new HttpException(400, "Something went wrong"));
                } else {
                    response.status(200).send(new HttpResponse(null, result, "Virtual_id generated", null));
                }
            });
        }
        catch (err) {
            response.status(400).send(new HttpException(400, "Something went wrong"));
        }
    }
}
export default virtualIdSqlController;