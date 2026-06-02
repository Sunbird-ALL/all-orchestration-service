import { NextFunction, Request, Response } from "express";
import { genarateVirtualIdValidationSchema } from '../../validates/virtual_id.validate';
import HttpException from "../../../common/http.Exception/http.Exception";
import HttpResponse from "../../../common/http.Response/http.Response";
import virtualIdService from "./virtual_id.service";
import { logoutValidationSchema } from "../../validates/logoutValidation";
import * as XLSX from 'xlsx';
import multer from 'multer';
import { toHttpException } from "../../../common/middleware/api-error.middleware";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files are allowed'));
        }
    }
});

class virtualIdController {

    static async genarateVirtualId(request: Request, response: Response, next: NextFunction) {
        try {
            const username = request.query.username;

            const { error } = genarateVirtualIdValidationSchema.validate({ ...request.query });
            if (error) {
                return next(HttpException.fromJoi(error));
            }
            virtualIdService.generateId(username, (err: any, result: any) => {
                if (err) {
                    return next(new HttpException(400, "Something went wrong", { code: 'VIRTUAL_ID_GENERATE_FAILED' }));
                }
                response.status(200).send(new HttpResponse(null, result, "Token generated", null));
            });
        }
        catch (err) {
            next(toHttpException(err));
        }
    }


    static async logout(request: Request, response: Response, next: NextFunction) {
        try {
            const { error } = logoutValidationSchema.validate(request.body);
            if (error) {
                return next(HttpException.fromJoi(error));
            }

            const token = request.body.token;
            const result = await virtualIdService.logout(token);

            if (result?.success) {
                return response.status(200).send(new HttpResponse(null, null, 'Logged out successfully', null));
            }
            return next(new HttpException(400, 'Logout failed', { code: 'LOGOUT_FAILED' }));
        } catch (err) {
            next(toHttpException(err));
        }
    }

    static async tokenStatus(request: Request, response: Response, next: NextFunction) {
        try {
            const user_id = request.body.user_id;
            const result = await virtualIdService.tokenStatus(user_id);
            if (result) {
                return response.status(200).send(new HttpResponse(null, result, "user status return", null));
            }
            return next(new HttpException(400, 'Unable to load token status', { code: 'TOKEN_STATUS_FAILED' }));
        } catch (err) {
            next(toHttpException(err));
        }
    }

}
export default virtualIdController;
