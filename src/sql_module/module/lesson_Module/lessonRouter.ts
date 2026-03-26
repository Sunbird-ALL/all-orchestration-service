import { Router } from "express";
import { asyncRoute } from "../../../common/middleware/api-error.middleware";
import lessonSqlController from "./lessonController";

const lessonSqlRouter = Router();

lessonSqlRouter.post("/addLesson", asyncRoute(lessonSqlController.addLesson));

lessonSqlRouter.get("/getLessonProgressByUserId/:userId", asyncRoute(lessonSqlController.getLessonProgress));

export default lessonSqlRouter;