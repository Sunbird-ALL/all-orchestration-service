import { Router } from "express";
import MozhigalTrackerController from "./mozhigal_tracker.controller";
import versionedAuth from "../../middlewares/versionedAuth";

const mozhigalTrackerRouter = Router();

mozhigalTrackerRouter.post("/:lessonId", versionedAuth, MozhigalTrackerController.addLearningLogs);

mozhigalTrackerRouter.get("/student/:userId?", versionedAuth, MozhigalTrackerController.getCumulativeScore);

mozhigalTrackerRouter.get("/lessons/:userId?", versionedAuth, MozhigalTrackerController.getLessonWiseScore);


export default mozhigalTrackerRouter;