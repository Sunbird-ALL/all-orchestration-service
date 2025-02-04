import { Request, Response } from "express";
import { addLearningLogsValidationSchema, getCumulativeScoreValidationSchema, getLessonWiseScoreValidationSchema } from '../../validates/mozhigal_tracker.validate';
import HttpException from "../../../common/http.Exception/http.Exception";
import HttpResponse from "../../../common/http.Response/http.Response";
import MozhigalTrackerServices from "./mozhigal_tracker.service";


class MozhigalTrackerController {

    static async addLearningLogs(request: Request, response: Response, next: CallableFunction) {
        try {
            const studentId = response.locals.virtual_id;

            const learningLogsData = request.body;
            const lessonId = request.params.lessonId;

            const { error } = addLearningLogsValidationSchema.validate({ userId: studentId, ...request.body, lessonId });
            if (error) {
                response.status(400).send(new HttpResponse(null, null, "Required fields are missing", null));
            }
            else {

                if (learningLogsData.score > 100) {
                    learningLogsData.score = 100
                } else if (learningLogsData.score < 0) {
                    learningLogsData.score = 0
                }

                await MozhigalTrackerServices.addLearningLogs(learningLogsData, lessonId, studentId, (err: any, result: any) => {
                    if (err) {
                        response.status(400).send(new HttpException(400, "Something went wrong"));
                    } else {
                        response.status(200).send(new HttpResponse(null, result, "New score entry created successfully", null));
                    }
                });
            }
        }
        catch (err) {
            response.status(400).send(new HttpException(400, "Something went wrong"));
        }
    }

    static async getCumulativeScore(request: Request, response: Response, next: CallableFunction) {
        try {
            const studentId = response.locals.virtual_id;

            const { error } = getCumulativeScoreValidationSchema.validate({ userId: studentId });
            if (error) {
                response.status(400).send(new HttpResponse(null, null, "Required fields are missing", null));
            }
            else {

                await MozhigalTrackerServices.getCumulativeScore(studentId, (err: any, result: any) => {
                    if (err) {
                        response.status(400).send(new HttpException(400, "Something went wrong"));
                    } else {
                        response.status(200).send(new HttpResponse(null, result, "Students Cumulative Score Returned", null));
                    }
                });
            }
        }
        catch (err) {
            response.status(400).send(new HttpException(400, "Something went wrong"));
        }
    }

    static async getLessonWiseScore(request: Request, response: Response, next: CallableFunction) {
        try {
            const studentId = response.locals.virtual_id;

            const { error } = getLessonWiseScoreValidationSchema.validate({ userId: studentId });
            if (error) {
                response.status(400).send(new HttpResponse(null, null, "Required fields are missing", null));
            }
            else {

                await MozhigalTrackerServices.getLessonWiseScore(studentId, (err: any, result: any) => {
                    if (err) {
                        response.status(400).send(new HttpException(400, "Something went wrong"));
                    } else {
                        response.status(200).send(new HttpResponse(null, result, "Students Cumulative Score Returned", null));
                    }
                });
            }
        }
        catch (err) {
            response.status(400).send(new HttpException(400, "Something went wrong"));
        }
    }
}
export default MozhigalTrackerController;