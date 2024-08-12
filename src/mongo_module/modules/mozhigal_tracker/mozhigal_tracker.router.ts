import { Router } from "express";
import MozhigalTrackerController from "./mozhigal_tracker.controller";

const mozhigalTrackerRouter = Router();

mozhigalTrackerRouter.post("/:studentId/:lessonId", MozhigalTrackerController.addLearningLogs);

mozhigalTrackerRouter.get("/student/:studentId", MozhigalTrackerController.getCumulativeScore);

mozhigalTrackerRouter.get("/lessons/:studentId", MozhigalTrackerController.getLessonWiseScore);


export default mozhigalTrackerRouter;