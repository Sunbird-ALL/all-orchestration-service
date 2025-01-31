import { NextFunction, Request, Response } from "express";
import learnerProgressServices from "./learner_progress.services";
import HttpException from "../../../common/http.Exception/http.Exception";
import HttpResponse from "../../../common/http.Response/http.Response";


class LearnerProgressController {
   
    static async createLearnerProgress(request: Request, response: Response, next: CallableFunction) {
        try {
            const learnerProgress = request.body;
            await learnerProgressServices.createLearnerProgress(learnerProgress, (err: any, result: any) => {
                if (err) {
                    next(new HttpException(400, "Something went wrong"));
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
           
            await learnerProgressServices.getLessonProgress(userID,language,(err: any, result: any) => {
                if (err) {
                    next(new HttpException(400, "Something went wrong"));
                } else {
                    response.status(200).send(new HttpResponse("GetLessonProgress", result, "Learner Progress Returned", null));
                }
            });
        } catch (err) {
            next(new HttpException(400, "Something went wrong"));
        }
    }
}
export default LearnerProgressController;