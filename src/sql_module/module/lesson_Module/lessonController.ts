
import { Request, Response } from 'express';
import HttpException from '../../../common/http.Exception/http.Exception';
import HttpResponse from '../../../common/http.Response/http.Response';
import lessonSqlService from './lessonService';


class lessonSqlController {
    // Sql add lesson
    static async addLesson(request: Request, response: Response, next: CallableFunction) {
        try {
            const lesson = request.body;
            lessonSqlService.addLessonSql(lesson, (err: any, result: any) => {
                if (err) {
                    response.status(400).send(new HttpException(400, "Something went wrong"));
                } else {
                    response.status(200).send(new HttpResponse(null, result, "Lesson added", null));
                }
            });
        }
        catch (err) {
            response.status(400).send(new HttpException(400, "Something went wrong"));
        }
    }

    // sql get Lesson
    static async getLessonProgress(request: Request, response: Response, next: CallableFunction) {
        try {
            const userID = request.params.userId;
            const language = request.query.language;
            
            lessonSqlService.getLessonProgress(userID, language, (err: any, result: any) => {
                if (err) {
                    response.status(400).send(new HttpException(400, "Something went wrong"));
                } else {
                    response.status(200).send(new HttpResponse("GetLessonProgress", result, "Total Lesson Progress Returned", null));
                }
            });
        } catch (err) {
            response.status(400).send(new HttpException(400, "Something went wrong"));
        }
    }

}
export default lessonSqlController;
