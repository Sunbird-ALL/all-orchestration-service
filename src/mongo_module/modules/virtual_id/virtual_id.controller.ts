import { Request, Response } from "express";
import { genarateVirtualIdValidationSchema } from '../../validates/virtual_id.validate';
import HttpException from "../../../common/http.Exception/http.Exception";
import HttpResponse from "../../../common/http.Response/http.Response";
import virtualIdService from "./virtual_id.service";

class virtualIdController {

    static async genarateVirtualId(request: Request, response: Response, next: CallableFunction) {
        try {
            const username = request.query.username;
            const version = request.originalUrl.split("/")[1];
        
            const { error } = genarateVirtualIdValidationSchema.validate({...request.query });
            if (error) {
                response.status(400).send(new HttpResponse(null, null,"Required fields are missing", null, (request as any).version));
            } else {
                virtualIdService.generateId(username,version,(err: any, result: any) => {
                if (err) {
                    response.status(400).send(new HttpException(400, "Something went wrong"));
                } else {
                    response.status(200).send(new HttpResponse(null, result, "Token generated", null, (request as any).version));
                }
            });
        }
        }
        catch (err) {
            response.status(400).send(new HttpException(400, "Something went wrong"));
        }
    }
}
export default virtualIdController;