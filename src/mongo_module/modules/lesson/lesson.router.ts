import { Router } from "express";
import verifyToken from "../../middlewares/verify.token";
import { asyncRoute } from "../../../common/middleware/api-error.middleware";
import lessonController from "./lesson.controller";

const lessonRouter = Router();

lessonRouter.post("/addLesson", verifyToken, asyncRoute(lessonController.addLesson));

lessonRouter.get("/getLessonProgressByUserId", verifyToken, asyncRoute(lessonController.getLessonProgress));

export default lessonRouter;