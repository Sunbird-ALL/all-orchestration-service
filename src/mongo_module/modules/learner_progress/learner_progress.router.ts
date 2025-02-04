import { Router } from "express";
import verifyToken from '../../middlewares/verify.token';
import learnerProgressController from "./learner_progress.controller";


const lessonRouter = Router();

lessonRouter.post("/createLearnerProgress", verifyToken, learnerProgressController.createLearnerProgress);

lessonRouter.get("/learnerProgressByuserId", verifyToken, learnerProgressController.learnerProgressByuserId);

export default lessonRouter;