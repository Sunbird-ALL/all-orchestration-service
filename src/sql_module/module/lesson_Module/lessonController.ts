
import { NextFunction, Request, Response } from 'express';
import HttpException from '../../../common/http.Exception/http.Exception';
import HttpResponse from '../../../common/http.Response/http.Response';
import lessonSqlService from './lessonService';
import { toHttpException } from '../../../common/middleware/api-error.middleware';


class lessonSqlController {
    static async addLesson(request: Request, response: Response, next: NextFunction) {
        try {
            const lesson = request.body;
            lessonSqlService.addLessonSql(lesson, (err: any, result: any) => {
                if (err) {
                    return next(new HttpException(400, "Something went wrong", { code: 'SQL_LESSON_ADD_FAILED' }));
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
            const userID = request.params.userId;
            const language = request.query.language;

            lessonSqlService.getLessonProgress(userID, language, (err: any, result: any) => {
                if (err) {
                    return next(new HttpException(400, "Something went wrong", { code: 'SQL_LESSON_PROGRESS_FAILED' }));
                }
                response.status(200).send(new HttpResponse("GetLessonProgress", result, "Total Lesson Progress Returned", null));
            });
        } catch (err) {
            next(toHttpException(err));
        }
    }

}
export default lessonSqlController;
