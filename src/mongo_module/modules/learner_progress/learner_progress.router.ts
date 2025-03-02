import { Router } from "express";
import verifyToken from '../../middlewares/verify.token';
import learnerProgressController from "./learner_progress.controller";
import versionedAuth from "../../middlewares/versionedAuth";


const lessonRouter = Router();

lessonRouter.post("/createLearnerProgress", versionedAuth, learnerProgressController.createLearnerProgress);

lessonRouter.get("/learnerProgressByuserId/:userId?", versionedAuth, learnerProgressController.learnerProgressByuserId);

export default lessonRouter;