import { Router } from "express";
import lessonSqlController from "./lessonController";

const lessonSqlRouter = Router();

lessonSqlRouter.post("/addLesson", lessonSqlController.addLesson);

lessonSqlRouter.get("/getLessonProgressByUserId/:userId", lessonSqlController.getLessonProgress);

export default lessonSqlRouter;