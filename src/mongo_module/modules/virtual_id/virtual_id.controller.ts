import { Request, Response } from "express";
import { genarateVirtualIdValidationSchema } from '../../validates/virtual_id.validate';
import HttpException from "../../../common/http.Exception/http.Exception";
import HttpResponse from "../../../common/http.Response/http.Response";
import virtualIdService from "./virtual_id.service";

class virtualIdController {

    static async genarateVirtualId(request: Request, response: Response, next: CallableFunction) {
        try {
            const username = request.query.username;

            const { error } = genarateVirtualIdValidationSchema.validate({...request.query });
            if (error) {
                response.status(400).send(new HttpResponse(null, null,"Required fields are missing", null));
            } else {
                virtualIdService.generateId(username,(err: any, result: any) => {
                if (err) {
                    response.status(200).send(new HttpException(400, "Something went wrong"));
                } else {
                    response.status(200).send(new HttpResponse(null, result, "Virtual_id generated", null));
                }
            });
        }
        }
        catch (err) {
            response.status(200).send(new HttpException(400, "Something went wrong"));
        }
    }
}
export default virtualIdController;