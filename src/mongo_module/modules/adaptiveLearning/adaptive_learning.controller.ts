import { NextFunction, Request, Response } from "express";
import HttpException from "../../../common/http.Exception/http.Exception";
import HttpResponse from "../../../common/http.Response/http.Response";
import AdaptiveLearningServices from "./adaptive_learning.service";
import { addSchoolUdiseValidationScheme, validateUdiseValidationScheme, deleteUdiseValidationScheme } from "../../validates/adaptive_learning.validate";
import { toHttpException } from "../../../common/middleware/api-error.middleware";


class AdaptiveLearningController {

    static async addSchoolUdise(request: Request, response: Response, next: NextFunction) {
        try {
            const schoolData = request.body;

            const { error } = addSchoolUdiseValidationScheme.validate(request.body);
            if (error) {
                return next(HttpException.fromJoi(error));
            }
            await AdaptiveLearningServices.addSchoolUdise(schoolData, (err: any, result: any) => {
                if (err) {
                    return next(new HttpException(400, "Something went wrong", { code: 'SCHOOL_UDISE_ADD_FAILED' }));
                }
                response.status(200).send(new HttpResponse(null, result, "School data added", null));
            });
        }
        catch (err) {
            next(toHttpException(err));
        }
    }

    static async validateUdise(request: Request, response: Response, next: NextFunction) {
        try {
            const udiseCode = request.params.udise_code;

            const { error } = validateUdiseValidationScheme.validate(request.params);
            if (error) {
                return next(HttpException.fromJoi(error));
            }
            await AdaptiveLearningServices.validateUdise(udiseCode, (err: any, result: any) => {
                if (err) {
                    return next(new HttpException(400, "Something went wrong", { code: 'UDISE_VALIDATE_FAILED' }));
                }
                response.status(200).send(new HttpResponse("GetSchoolData", result, "School Data returned", null));
            });
        } catch (err) {
            next(toHttpException(err));
        }
    }

    static async deleteUdise(request: Request, response: Response, next: NextFunction) {
        try {
            const udiseCode = request.params.udise_code;

            const { error } = deleteUdiseValidationScheme.validate(request.params);
            if (error) {
                return next(HttpException.fromJoi(error));
            }
            await AdaptiveLearningServices.deleteUdise(udiseCode, (err: any, result: any) => {
                if (err) {
                    return next(new HttpException(400, "Something went wrong", { code: 'UDISE_DELETE_FAILED' }));
                }
                response.status(200).send(new HttpResponse("DeleteSchoolData", result, "udise code deleted", null));
            });
        } catch (err) {
            next(toHttpException(err));
        }
    }

    static async getAllUdeise(request: Request, response: Response, next: NextFunction) {
        try {
            await AdaptiveLearningServices.getAllUdeise((err: any, result: any) => {
                if (err) {
                    return next(new HttpException(400, "Something went wrong", { code: 'UDISE_LIST_FAILED' }));
                }
                response.status(200).send(new HttpResponse("getAllUdeise", result, "School Data returned", null));
            });
        } catch (err) {
            next(toHttpException(err));
        }
    }
}
export default AdaptiveLearningController;
