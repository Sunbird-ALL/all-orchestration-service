import { Request, Response } from "express";
import HttpException from "../../../common/http.Exception/http.Exception";
import HttpResponse from "../../../common/http.Response/http.Response";
import learnerProgressService from "./learner_progress.service";
import { learner_progress } from "../../schema/learnerProgress";


class learnerProgressSqlController {

    // Add Learner Progress
    static async addLearnerProgress(request: Request, response: Response, next: CallableFunction) {
        try {
            const lessonProgress = request.body;
            learnerProgressService.addlessonProgress(lessonProgress, (err: any, result: any) => {
                if (err) {
                    next(new HttpException(400, "Something went wrong"));
                } else {
                    response.status(200).send(new HttpResponse(null, result, "Lesson added", null));
                }
            });
        }
        catch (err) {
            next(new HttpException(400, "Something went wrong"));
        }
    }

    // Get latest learner progress by ID
    static async getLatestLearnerProgressById(request: Request, response: Response, next: CallableFunction) {
        try {
            const id: string = request.params.id;
            learnerProgressService.getLatestLearnerProgressByuserId(id, (err: any, result: any) => {
                if (err) {
                    next(new HttpException(400, "Something went wrong"));
                } else {
                    response.status(200).send(new HttpResponse(null, result, "Latest learner progress retrieved", null));
                }
            });
        } catch (err) {
            next(new HttpException(400, "Something went wrong"));
        }
    }

    // Get learner progress by ID
    static async getLearnerProgressById(request: Request, response: Response, next: CallableFunction) {
        try {
            const id: number = parseInt(request.params.id);
            learnerProgressService.getLearnerProgressById(id, (err: any, result: any) => {
                if (err) {
                    next(new HttpException(400, "Something went wrong"));
                } else {
                    response.status(200).send(new HttpResponse(null, result, "Learner progress retrieved", null));
                }
            });
        } catch (err) {
            next(new HttpException(400, "Something went wrong"));
        }
    }

    // Get learner progress by user ID
    static async getLearnerProgressByuserId(request: Request, response: Response, next: CallableFunction) {
        try {
            const id: string = request.params.id;
            learnerProgressService.getLearnerProgressByUserId(id, (err: any, result: any) => {
                if (err) {
                    next(new HttpException(400, "Something went wrong"));
                } else {
                    response.status(200).send(new HttpResponse(null, result, "Learner progress retrieved", null));
                }
            });
        } catch (err) {
            next(new HttpException(400, "Something went wrong"));
        }
    }

    // Get learner progress by session ID
    static async getLearnerProgressBysessionId(request: Request, response: Response, next: CallableFunction) {
        try {
            const id: string = request.params.id;
            learnerProgressService.getLearnerProgressBySessionId(id, (err: any, result: any) => {
                if (err) {
                    next(new HttpException(400, "Something went wrong"));
                } else {
                    response.status(200).send(new HttpResponse(null, result, "Learner progress retrieved", null));
                }
            });
        } catch (err) {
            next(new HttpException(400, "Something went wrong"));
        }
    }

    // Get learner progress by sub-session ID
    static async getLearnerProgressBysubsessionId(request: Request, response: Response, next: CallableFunction) {
        try {
            const id: string = request.params.id;
            learnerProgressService.getLearnerProgressBySubSessionId(id, (err: any, result: any) => {
                if (err) {
                    next(new HttpException(400, "Something went wrong"));
                } else {
                    response.status(200).send(new HttpResponse(null, result, "Learner progress retrieved", null));
                }
            });
        } catch (err) {
            next(new HttpException(400, "Something went wrong"));
        }
    }

    // Update learner progress by id
    static async updateLearnerProgressById(request: Request, response: Response, next: CallableFunction) {
        try {
            const id: number = parseInt(request.params.id);
            const newData: Partial<learner_progress> = request.body; // Assuming you provide only the fields that need to be updated
            learnerProgressService.updateLearnerProgressById(id, newData, (err: any, result: any) => {
                if (err) {
                    next(new HttpException(400, "Something went wrong"));
                } else {
                    response.status(200).send(new HttpResponse(null, result, "Learner progress updated successfully", null));
                }
            });
        } catch (err) {
            next(new HttpException(400, "Something went wrong"));
        }
    }

    // Update learner progress by id
    static async updateLearnerProgressBysubsessionId(request: Request, response: Response, next: CallableFunction) {
        try {
            const id: string = request.params.id;
            const newData: Partial<learner_progress> = request.body; // Assuming you provide only the fields that need to be updated
            learnerProgressService.updateLearnerProgressBysubsessionId(id, newData, (err: any, result: any) => {
                if (err) {
                    next(new HttpException(400, "Something went wrong"));
                } else {
                    response.status(200).send(new HttpResponse(null, result, "Learner progress updated successfully", null));
                }
            });
        } catch (err) {
            next(new HttpException(400, "Something went wrong"));
        }
    }

    // Delete learner progress by id
    static async deleteLearnerProgressById(request: Request, response: Response, next: CallableFunction) {
        try {
            const id: string = request.params.id;
            learnerProgressService.deleteLearnerProgressById(id, (err: any, result: any) => {
                if (err) {
                    next(new HttpException(400, "Something went wrong"));
                } else {
                    response.status(200).send(new HttpResponse(null, result, "Learner progress deleted successfully", null));
                }
            });
        } catch (err) {
            next(new HttpException(400, "Something went wrong"));
        }
    }

    // Delete learner progress by user id
    static async deleteLearnerProgressByuserId(request: Request, response: Response, next: CallableFunction) {
        try {
            const userId: string = request.params.id;
            learnerProgressService.deleteLearnerProgressByUserId(userId, (err: any, result: any) => {
                if (err) {
                    next(new HttpException(400, "Something went wrong"));
                } else {
                    response.status(200).send(new HttpResponse(null, result, "Learner progress deleted successfully", null));
                }
            });
        } catch (err) {
            next(new HttpException(400, "Something went wrong"));
        }
    }

    // Delete learner progress by sub-session id
    static async deleteLearnerProgressBysubsessionId(request: Request, response: Response, next: CallableFunction) {
        try {
            const subSessionId: string = request.params.id;
            learnerProgressService.deleteLearnerProgressBySubSessionId(subSessionId, (err: any, result: any) => {
                if (err) {
                    next(new HttpException(400, "Something went wrong"));
                } else {
                    response.status(200).send(new HttpResponse(null, result, "Learner progress deleted successfully", null));
                }
            });
        } catch (err) {
            next(new HttpException(400, "Something went wrong"));
        }
    }
}
export default learnerProgressSqlController;