import { Router } from "express";
import verifyToken from '../../middlewares/verify.token';
import { asyncRoute } from "../../../common/middleware/api-error.middleware";
import learnerProgressController from "./learner_progress.controller";


const lessonRouter = Router();

lessonRouter.post("/createLearnerProgress", verifyToken, asyncRoute(learnerProgressController.createLearnerProgress));

lessonRouter.get("/learnerProgressByuserId", verifyToken, asyncRoute(learnerProgressController.learnerProgressByuserId));

export default lessonRouter;