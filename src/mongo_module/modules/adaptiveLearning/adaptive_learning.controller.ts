import { NextFunction, Request, Response } from "express";
import HttpException from "../../../common/http.Exception/http.Exception";
import HttpResponse from "../../../common/http.Response/http.Response";
import AdaptiveLearningServices from "./adaptive_learning.service";
import {addSchoolUdiseValidationScheme,validateUdiseValidationScheme,deleteUdiseValidationScheme} from "../../validates/adaptive_learning.validate"


class AdaptiveLearningController {

    static async addSchoolUdise(request: Request, response: Response, next: CallableFunction) {
        try {
            const schoolData = request.body;
            const { error } = addSchoolUdiseValidationScheme.validate(request.body);
            if(error){
                response.status(400).send(new HttpResponse(null, null,"Required fields are missing", null));
            }
            else{
                await AdaptiveLearningServices.addSchoolUdise(schoolData, (err: any, result: any) => {
                    if (err) {
                        next(new HttpException(400, "Something went wrong"));
                    } else {
                        response.status(200).send(new HttpResponse(null, result, "School data added", null));
                    }
                });
            }
        }
        catch (err) {
            response.status(200).send(new HttpException(400, "Something went wrong"));
        }
    }

    static async validateUdise(request: Request, response: Response, next: NextFunction) {
        try {
            const udiseCode = request.params.udise_code;
            const { error } = validateUdiseValidationScheme.validate(request.params);

            if(error){
                response.status(400).send(new HttpResponse(null, null,"Required fields are missing", null));
            }else{
                await AdaptiveLearningServices.validateUdise(udiseCode, (err: any, result: any) => {
                    if (err) {
                        next(new HttpException(400, "Something went wrong"));
                    } else {
                        response.status(200).send(new HttpResponse("GetSchoolData", result, "School Data returned", null));
                    }
                });
            }
        } catch (err) {
            response.status(200).send(new HttpException(400, "Something went wrong"));
        }
    }

    static async deleteUdise(request: Request, response: Response, next: NextFunction) {
        try {
            const udiseCode = request.params.udise_code;
            const { error } = deleteUdiseValidationScheme.validate(request.params);
            if(error){
                response.status(400).send(new HttpResponse(null, null,"Required fields are missing", null));
            }
            else{
                await AdaptiveLearningServices.deleteUdise(udiseCode, (err: any, result: any) => {
                    if (err) {
                        next(new HttpException(400, "Something went wrong"));
                    } else {
                        response.status(200).send(new HttpResponse("DeleteSchoolData", result, "udise code deleted", null));
                    }
                });
            }
        } catch (err) {
            response.status(200).send(new HttpException(400, "Something went wrong"));
        }
    }

    static async getAllUdeise(request: Request, response: Response, next: NextFunction) {
        try {
            await AdaptiveLearningServices.getAllUdeise((err: any, result: any) => {
                if (err) {
                    response.status(200).send(new HttpException(400, "Something went wrong"));
                } else {
                    response.status(200).send(new HttpResponse("getAllUdeise", result, "School Data returned", null));
                }
            });
        } catch (err) {
            response.status(200).send(new HttpException(400, "Something went wrong"));
        }
    }
}
export default AdaptiveLearningController;