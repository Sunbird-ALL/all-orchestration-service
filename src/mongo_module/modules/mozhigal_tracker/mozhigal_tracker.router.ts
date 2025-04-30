import { Router } from "express";
import verifyToken from '../../middlewares/verify.token';
import MozhigalTrackerController from "./mozhigal_tracker.controller";

const mozhigalTrackerRouter = Router();

mozhigalTrackerRouter.post("/:lessonId", verifyToken, MozhigalTrackerController.addLearningLogs);

mozhigalTrackerRouter.get("/student", verifyToken, MozhigalTrackerController.getCumulativeScore);

mozhigalTrackerRouter.get("/lessons", verifyToken, MozhigalTrackerController.getLessonWiseScore);


export default mozhigalTrackerRouter;