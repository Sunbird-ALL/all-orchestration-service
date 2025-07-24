import { Router } from "express";
import learnerProgressController from "./learner_progress.controller";
import validateApiKey from "../../middlewares/validate.apiKey";


const lessonRouter = Router();

lessonRouter.post("/createLearnerProgress", validateApiKey, learnerProgressController.createLearnerProgress);

lessonRouter.get("/learnerProgressByuserId/:userId", learnerProgressController.learnerProgressByuserId);

export default lessonRouter;