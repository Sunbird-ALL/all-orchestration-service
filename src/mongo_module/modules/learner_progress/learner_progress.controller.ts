import { NextFunction, Request, Response } from "express";
import { createLearnerProgressValidationSchema, learnerProgressByuserIdValidationSchema } from '../../validates/learner_progress.validate';
import learnerProgressServices from "./learner_progress.services";
import HttpException from "../../../common/http.Exception/http.Exception";
import HttpResponse from "../../../common/http.Response/http.Response";
import { toHttpException } from "../../../common/middleware/api-error.middleware";


class LearnerProgressController {

    static async createLearnerProgress(request: Request, response: Response, next: NextFunction) {
        try {
            const userId = response.locals.virtual_id.toString();
            const learnerProgress = request.body;
            learnerProgress.userId = userId;

            const { error } = createLearnerProgressValidationSchema.validate(learnerProgress);
            if (error) {
                return next(HttpException.fromJoi(error));
            }
            await learnerProgressServices.createLearnerProgress(learnerProgress, (err: any, result: any) => {
                if (err) {
                    return next(new HttpException(400, "Something went wrong", { code: 'LEARNER_PROGRESS_CREATE_FAILED' }));
                }
                response.status(200).send(new HttpResponse(null, result, "Learner Progress added", null));
            });
        }
        catch (err) {
            next(toHttpException(err));
        }
    }

    static async learnerProgressByuserId(request: Request, response: Response, next: NextFunction) {
        try {
            const userID = response.locals.virtual_id.toString();
            const language = request.query.language;

            const { error } = learnerProgressByuserIdValidationSchema.validate({ userId: userID, ...request.query });
            if (error) {
                return next(HttpException.fromJoi(error));
            }
            await learnerProgressServices.getLessonProgress(userID, language, (err: any, result: any) => {
                if (err) {
                    return next(new HttpException(400, "Something went wrong", { code: 'LEARNER_PROGRESS_GET_FAILED' }));
                }
                response.status(200).send(new HttpResponse("GetLessonProgress", result, "Learner Progress Returned", null));
            });
        } catch (err) {
            next(toHttpException(err));
        }
    }
}
export default LearnerProgressController;
