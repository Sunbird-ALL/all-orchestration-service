import { NextFunction, Request, Response } from "express";
import lessonServices from "./lesson.services";
import HttpException from "../../../common/http.Exception/http.Exception";
import HttpResponse from "../../../common/http.Response/http.Response";


class lessonController {
   
    static async addLesson(request: Request, response: Response, next: CallableFunction) {
        try {
            const lesson = request.body;
            lessonServices.addLesson(lesson, (err: any, result: any) => {
                if (err) {
                    response.status(200).send(new HttpException(400, "Something went wrong"));
                } else {
                    response.status(200).send(new HttpResponse(null, result, "Lesson added", null));
                }
            });
        }
        catch (err) {
            response.status(200).send(new HttpException(400, "Something went wrong"));
        }
    }

    static async getLessonProgress(request: Request, response: Response, next: NextFunction) {
        try {
            const userID = request.params.userId;
            const language = request.query.language;
           
            lessonServices.getLessonProgress(userID,language,(err: any, result: any) => {
                if (err) {
                    response.status(200).send(new HttpException(400, "Something went wrong"));
                } else {
                    response.status(200).send(new HttpResponse("GetLessonProgress", result, "Total Lesson Progress Returned", null));
                }
            });
        } catch (err) {
            response.status(200).send(new HttpException(400, "Something went wrong"));
        }
    }
}
export default lessonController;