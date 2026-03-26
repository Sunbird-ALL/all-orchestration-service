import { NextFunction, Request, Response } from "express";
import { addLearningLogsValidationSchema, getCumulativeScoreValidationSchema, getLessonWiseScoreValidationSchema } from '../../validates/mozhigal_tracker.validate';
import HttpException from "../../../common/http.Exception/http.Exception";
import HttpResponse from "../../../common/http.Response/http.Response";
import MozhigalTrackerServices from "./mozhigal_tracker.service";
import { toHttpException } from "../../../common/middleware/api-error.middleware";


class MozhigalTrackerController {

    static async addLearningLogs(request: Request, response: Response, next: NextFunction) {
        try {
            const studentId = response.locals.virtual_id.toString();
            const learningLogsData = request.body;
            const lessonId = request.params.lessonId;

            const { error } = addLearningLogsValidationSchema.validate({ userId: studentId, ...request.body, lessonId });
            if (error) {
                return next(HttpException.fromJoi(error));
            }

            if (learningLogsData.score > 100) {
                learningLogsData.score = 100;
            } else if (learningLogsData.score < 0) {
                learningLogsData.score = 0;
            }

            await MozhigalTrackerServices.addLearningLogs(learningLogsData, lessonId, studentId, (err: any, result: any) => {
                if (err) {
                    return next(new HttpException(400, "Something went wrong", { code: 'MOZHIGAL_LOG_ADD_FAILED' }));
                }
                response.status(200).send(new HttpResponse(null, result, "New score entry created successfully", null));
            });
        }
        catch (err) {
            next(toHttpException(err));
        }
    }

    static async getCumulativeScore(request: Request, response: Response, next: NextFunction) {
        try {
            const studentId = response.locals.virtual_id.toString();

            const { error } = getCumulativeScoreValidationSchema.validate({ userId: studentId });
            if (error) {
                return next(HttpException.fromJoi(error));
            }

            await MozhigalTrackerServices.getCumulativeScore(studentId, (err: any, result: any) => {
                if (err) {
                    return next(new HttpException(400, "Something went wrong", { code: 'MOZHIGAL_CUMULATIVE_FAILED' }));
                }
                response.status(200).send(new HttpResponse(null, result, "Students Cumulative Score Returned", null));
            });
        }
        catch (err) {
            next(toHttpException(err));
        }
    }

    static async getLessonWiseScore(request: Request, response: Response, next: NextFunction) {
        try {
            const studentId = response.locals.virtual_id.toString();

            const { error } = getLessonWiseScoreValidationSchema.validate({ userId: studentId });
            if (error) {
                return next(HttpException.fromJoi(error));
            }

            await MozhigalTrackerServices.getLessonWiseScore(studentId, (err: any, result: any) => {
                if (err) {
                    return next(new HttpException(400, "Something went wrong", { code: 'MOZHIGAL_LESSON_SCORE_FAILED' }));
                }
                response.status(200).send(new HttpResponse(null, result, "Students Cumulative Score Returned", null));
            });
        }
        catch (err) {
            next(toHttpException(err));
        }
    }
}
export default MozhigalTrackerController;
