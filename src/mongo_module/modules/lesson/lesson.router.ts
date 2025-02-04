import { Router } from "express";
import lessonController from "./lesson.controller";
import verifyToken from "../../middlewares/verify.token";


const lessonRouter = Router();

lessonRouter.post("/addLesson",verifyToken ,lessonController.addLesson);

lessonRouter.get("/getLessonProgressByUserId", verifyToken, lessonController.getLessonProgress);

export default lessonRouter;