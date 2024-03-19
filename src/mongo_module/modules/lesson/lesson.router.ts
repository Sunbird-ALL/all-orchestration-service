import { Router } from "express";
import lessonController from "./lesson.controller";


const lessonRouter = Router();

lessonRouter.post("/addLesson", lessonController.addLesson);

lessonRouter.get("/getLessonProgressByUserId/:userId", lessonController.getLessonProgress);

export default lessonRouter;