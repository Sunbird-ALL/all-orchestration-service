import { Router } from "express";
import verifyToken from "../../middlewares/verify.token";
import lessonController from "./lesson.controller";

const lessonRouter = Router();

lessonRouter.post("/addLesson", verifyToken, lessonController.addLesson);

lessonRouter.get("/getLessonProgressByUserId", verifyToken, lessonController.getLessonProgress);

export default lessonRouter;