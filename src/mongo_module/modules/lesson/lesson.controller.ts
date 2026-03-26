import { NextFunction, Request, Response } from "express";
import { addLessonValidationSchema, getLessonProgressValidationSchema } from '../../validates/lesson.validate';
import lessonServices from "./lesson.services";
import HttpException from "../../../common/http.Exception/http.Exception";
import HttpResponse from "../../../common/http.Response/http.Response";
import { toHttpException } from "../../../common/middleware/api-error.middleware";

class lessonController {

    static async addLesson(request: Request, response: Response, next: NextFunction) {
        try {
            const userID = response.locals.virtual_id.toString();
            const lesson = request.body;
            lesson.userId = userID;

            const { error } = addLessonValidationSchema.validate(request.body);
            if (error) {
                return next(HttpException.fromJoi(error));
            }
            lessonServices.addLesson(lesson, (err: any, result: any) => {
                if (err) {
                    return next(new HttpException(400, "Something went wrong", { code: 'LESSON_ADD_FAILED' }));
                }
                response.status(200).send(new HttpResponse(null, result, "Lesson added", null));
            });
        }
        catch (err) {
            next(toHttpException(err));
        }
    }

    static async getLessonProgress(request: Request, response: Response, next: NextFunction) {
        try {
            const userID = response.locals.virtual_id;
            const language = request.query.language;

            const { error } = getLessonProgressValidationSchema.validate({ userId: userID, ...request.query });
            if (error) {
                return next(HttpException.fromJoi(error));
            }
            lessonServices.getLessonProgress(userID, language, (err: any, result: any) => {
                if (err) {
                    return next(new HttpException(400, "Something went wrong", { code: 'LESSON_PROGRESS_FAILED' }));
                }
                response.status(200).send(new HttpResponse("GetLessonProgress", result, "Total Lesson Progress Returned", null));
            });
        } catch (err) {
            next(toHttpException(err));
        }
    }
}
export default lessonController;
