import { Router } from "express";
import verifyToken from '../../middlewares/verify.token';
import { asyncRoute } from "../../../common/middleware/api-error.middleware";
import MozhigalTrackerController from "./mozhigal_tracker.controller";

const mozhigalTrackerRouter = Router();

mozhigalTrackerRouter.post("/:lessonId", verifyToken, asyncRoute(MozhigalTrackerController.addLearningLogs));

mozhigalTrackerRouter.get("/student", verifyToken, asyncRoute(MozhigalTrackerController.getCumulativeScore));

mozhigalTrackerRouter.get("/lessons", verifyToken, asyncRoute(MozhigalTrackerController.getLessonWiseScore));


export default mozhigalTrackerRouter;