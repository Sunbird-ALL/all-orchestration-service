import { NextFunction, Request, Response } from "express";
import HttpException from "../../../common/http.Exception/http.Exception";
import HttpResponse from "../../../common/http.Response/http.Response";
import BaselineService from "./baseline.service";
import { toHttpException } from "../../../common/middleware/api-error.middleware";


class BaselineController {

    static async addBaseline(request: Request, response: Response, next: NextFunction) {
        try {
            const baseline_data = request.body;
            BaselineService.addBaseline(baseline_data, (err: any, result: any) => {
                if (err) {
                    const msg = typeof err === 'string' ? err : 'Request failed';
                    return next(new HttpException(400, msg, { code: 'BASELINE_ADD_FAILED' }));
                }
                response.status(200).send(new HttpResponse(null, result, "Assessment added", null));
            });
        }
        catch (err) {
            next(toHttpException(err));
        }
    }

    static async getBaseline(request: Request, response: Response, next: NextFunction) {
        try {
            const studentId = request.params.studentId;
            const assessmentId = request.params.assessmentId;
            BaselineService.getBaseline(studentId, assessmentId, (err: any, result: any) => {
                if (err) {
                    const msg = typeof err === 'string' ? err : 'Request failed';
                    return next(new HttpException(400, msg, { code: 'BASELINE_GET_FAILED' }));
                }
                response.status(200).send(new HttpResponse(null, result, "Assessment data return", null));
            });
        }
        catch (err) {
            next(toHttpException(err));
        }
    }

}
export default BaselineController;
