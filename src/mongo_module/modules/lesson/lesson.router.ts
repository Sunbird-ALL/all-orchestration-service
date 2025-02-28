import { Router } from "express";
import verifyToken from "../../middlewares/verify.token";
import lessonController from "./lesson.controller";
import versionedAuth from "../../middlewares/versionedAuth";

const lessonRouter = Router();

lessonRouter.post("/addLesson", versionedAuth, lessonController.addLesson);

lessonRouter.get("/getLessonProgressByUserId/:userId?", versionedAuth, lessonController.getLessonProgress);

export default lessonRouter;