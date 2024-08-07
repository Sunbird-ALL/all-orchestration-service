import { NextFunction, Request, Response } from "express";
import HttpException from "../../../common/http.Exception/http.Exception";
import HttpResponse from "../../../common/http.Response/http.Response";
import adaptiveLearningServices from "./adaptive_learning.service";


class adaptiveLearningController {
   
    static async addSchoolUdise(request: Request, response: Response, next: CallableFunction) {
        try {
            const schoolData = request.body;
            adaptiveLearningServices.addSchoolUdise(schoolData, (err: any, result: any) => {
                if (err) {
                    next(new HttpException(400, err));
                } else {
                    response.status(200).send(new HttpResponse(null, result, "School data added", null));
                }
            });
        }
        catch (err) {
            next(new HttpException(400, "Something went wrong"));
        }
    }

    static async validateUdise(request: Request, response: Response, next: NextFunction) {
        try {
            const udiseCode = request.params.udise_code;

            adaptiveLearningServices.validateUdise(udiseCode,(err: any, result: any) => {
                if (err) {
                    next(new HttpException(400, err));
                } else {
                    response.status(200).send(new HttpResponse("GetSchoolData", result, "School Data returned", null));
                }
            });
        } catch (err) {
            console.log(err);
            next(new HttpException(400, "Something went wrong"));
        }
    }

    static async deleteUdise(request: Request, response: Response, next: NextFunction) {
        try {
            const udiseCode = request.params.udise_code;

            adaptiveLearningServices.deleteUdise(udiseCode,(err: any, result: any) => {
                if (err) {
                    next(new HttpException(400, err));
                } else {
                    response.status(200).send(new HttpResponse("DeleteSchoolData", result, "udise code deleted", null));
                }
            });
        } catch (err) {
            console.log(err);
            next(new HttpException(400, "Something went wrong"));
        }
    }

    static async getAllUdeise(request: Request, response: Response, next: NextFunction) {
        try {
            adaptiveLearningServices.getAllUdeise((err: any, result: any) => {
                if (err) {
                    next(new HttpException(400, err));
                } else {
                    response.status(200).send(new HttpResponse("getAllUdeise", result, "School Data returned", null));
                }
            });
        } catch (err) {
            console.log(err);
            next(new HttpException(400, "Something went wrong"));
        }
    }
}
export default adaptiveLearningController;