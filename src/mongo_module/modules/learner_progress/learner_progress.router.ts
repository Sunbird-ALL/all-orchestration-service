import { Router } from "express";
import learnerProgressController from "./learner_progress.controller";


const lessonRouter = Router();

lessonRouter.post("/createLearnerProgress", learnerProgressController.createLearnerProgress);

lessonRouter.get("/learnerProgressByuserId/:userId", learnerProgressController.learnerProgressByuserId);

export default lessonRouter;