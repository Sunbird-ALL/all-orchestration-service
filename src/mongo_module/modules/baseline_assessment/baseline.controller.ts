import { NextFunction, Request, Response } from "express";
import HttpException from "../../../common/http.Exception/http.Exception";
import HttpResponse from "../../../common/http.Response/http.Response";
import BaselineService from "./baseline.service";


class BaselineController {
   
    static async addBaseline(request: Request, response: Response, next: CallableFunction) {
        try {
            const baseline_data = request.body;
            BaselineService.addBaseline(baseline_data, (err: any, result: any) => {
                if (err) {
                    next(new HttpException(400, err));
                } else {
                    response.status(200).send(new HttpResponse(null, result, "Assessment added", null));
                }
            });
        }
        catch (err) {
            next(new HttpException(400, "Something went wrong"));
        }
    }

    static async getBaseline(request: Request, response: Response, next: CallableFunction) {
        try {
            const studentId = request.params.studentId;
            const assessmentId = request.params.assessmentId;
            BaselineService.getBaseline(studentId,assessmentId, (err: any, result: any) => {
                if (err) {
                    next(new HttpException(400, err));
                } else {
                    response.status(200).send(new HttpResponse(null, result, "Assessment data return", null));
                }
            });
        }
        catch (err) {
            next(new HttpException(400, "Something went wrong"));
        }
    }

}
export default BaselineController;