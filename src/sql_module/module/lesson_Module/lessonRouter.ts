import { Router } from "express";
import { asyncRoute } from "../../../common/middleware/api-error.middleware";
import verifyToken from "../../../mongo_module/middlewares/verify.token";
import lessonSqlController from "./lessonController";

const lessonSqlRouter = Router();

lessonSqlRouter.post("/addLesson", verifyToken, asyncRoute(lessonSqlController.addLesson));

lessonSqlRouter.get("/getLessonProgressByUserId", verifyToken, asyncRoute(lessonSqlController.getLessonProgress));

export default lessonSqlRouter;