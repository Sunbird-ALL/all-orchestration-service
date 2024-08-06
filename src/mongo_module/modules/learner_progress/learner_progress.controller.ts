import { NextFunction, Request, Response } from "express";
import lessonServices from "./learner_progress.services";
import HttpException from "../../../common/http.Exception/http.Exception";
import HttpResponse from "../../../common/http.Response/http.Response";


class LearnerProgressController {
   
    static async createLearnerProgress(request: Request, response: Response, next: CallableFunction) {
        try {
            const learnerProgress = request.body;
            await lessonServices.createLearnerProgress(learnerProgress, (err: any, result: any) => {
                if (err) {
                    next(new HttpException(400, err));
                } else {
                    response.status(200).send(new HttpResponse(null, result, "Learner Progress added", null));
                }
            });
        }
        catch (err) {
            next(new HttpException(400, "Something went wrong"));
        }
    }

    static async learnerProgressByuserId(request: Request, response: Response, next: NextFunction) {
        try {
            const userID = request.params.userId;
            const language = request.query.language;
           
            await lessonServices.getLessonProgress(userID,language,(err: any, result: any) => {
                if (err) {
                    next(new HttpException(400, err));
                } else {
                    response.status(200).send(new HttpResponse("GetLessonProgress", result, "Learner Progress Returned", null));
                }
            });
        } catch (err) {
            console.log(err);
            next(new HttpException(400, "Something went wrong"));
        }
    }
}
export default LearnerProgressController;