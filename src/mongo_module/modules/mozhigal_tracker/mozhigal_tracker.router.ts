import { Router } from "express";
import MozhigalTrackerController from "./mozhigal_tracker.controller";
import validateApiKey from "../../middlewares/validate.apiKey";

const mozhigalTrackerRouter = Router();

mozhigalTrackerRouter.post("/:studentId/:lessonId", validateApiKey, MozhigalTrackerController.addLearningLogs);

mozhigalTrackerRouter.get("/student/:studentId", MozhigalTrackerController.getCumulativeScore);

mozhigalTrackerRouter.get("/lessons/:studentId", MozhigalTrackerController.getLessonWiseScore);


export default mozhigalTrackerRouter;