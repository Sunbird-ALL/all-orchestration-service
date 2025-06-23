import { Request, Response } from "express";
import { genarateVirtualIdValidationSchema } from '../../validates/virtual_id.validate';
import HttpException from "../../../common/http.Exception/http.Exception";
import HttpResponse from "../../../common/http.Response/http.Response";
import virtualIdService from "./virtual_id.service";
import { logoutValidationSchema } from "../../validates/logoutValidation";

class virtualIdController {

    static async genarateVirtualId(request: Request, response: Response, next: CallableFunction) {
        try {
            const username = request.query.username;

            const { error } = genarateVirtualIdValidationSchema.validate({ ...request.query });
            if (error) {
                response.status(400).send(new HttpResponse(null, null, "Required fields are missing", null));
            } else {
                virtualIdService.generateId(username, (err: any, result: any) => {
                    if (err) {
                        response.status(400).send(new HttpException(400, "Something went wrong"));
                    } else {
                        response.status(200).send(new HttpResponse(null, result, "Token generated", null));
                    }
                });
            }
        }
        catch (err) {
            response.status(400).send(new HttpException(400, "Something went wrong"));
        }
    }



    static async logout(request: Request, response: Response, next: CallableFunction) {
        try {
            const { error } = logoutValidationSchema.validate(request.body);
            if (error) {
                return response.status(400).send(new HttpResponse(null, null, 'Token is required', null));
            }

            const token = request.body.token;
            const result = await virtualIdService.logout(token);

            if (result?.success) {
                return response.status(200).send(new HttpResponse(null, null, 'Logged out successfully', null));
            } else {
                return response.status(400).send(new HttpException(400, ""));
            }
        } catch (err) {
            return response.status(400).send(new HttpException(400, 'Something went wrong'));
        }
    }

    // Internally calling
    static async tokenStatus(request: Request, response: Response, next: CallableFunction) {
        try { 
            const user_id = request.body.user_id;
            const result = await virtualIdService.tokenStatus(user_id);
            if (result) {
                return response.status(200).send(new HttpResponse(null, result, "user status return", null));
            } else {
                return response.status(400).send(new HttpException(400, ""));
            }
        } catch (err) {
            return response.status(400).send(new HttpException(400, 'Something went wrong'));
        }
    }
}
export default virtualIdController;