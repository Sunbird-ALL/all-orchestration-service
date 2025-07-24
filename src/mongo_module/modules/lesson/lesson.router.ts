import { Router } from "express";
import lessonController from "./lesson.controller";
import validateApiKey from "../../middlewares/validate.apiKey";


const lessonRouter = Router();

lessonRouter.post("/addLesson", validateApiKey, lessonController.addLesson);

lessonRouter.get("/getLessonProgressByUserId/:userId", lessonController.getLessonProgress);

export default lessonRouter;