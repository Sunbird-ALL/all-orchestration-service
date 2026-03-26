import { Router } from "express";
import { asyncRoute } from "../../../common/middleware/api-error.middleware";
import learnerProgressSqlController from "./learner_progress.controller";

const learnerProgressSqlRouter = Router();

learnerProgressSqlRouter.post("/createLearnerProgress", asyncRoute(learnerProgressSqlController.addLearnerProgress));

learnerProgressSqlRouter.get("/latestLearnerProgress/:id", asyncRoute(learnerProgressSqlController.getLatestLearnerProgressById));

learnerProgressSqlRouter.get("/learnerProgressById/:id", asyncRoute(learnerProgressSqlController.getLearnerProgressById));

learnerProgressSqlRouter.get("/learnerProgressByuserId/:id", asyncRoute(learnerProgressSqlController.getLearnerProgressByuserId));

learnerProgressSqlRouter.get("/learnerProgressBysessionId/:id", asyncRoute(learnerProgressSqlController.getLearnerProgressBysessionId));

learnerProgressSqlRouter.get("/learnerProgressBysubsessionId/:id", asyncRoute(learnerProgressSqlController.getLearnerProgressBysubsessionId));

learnerProgressSqlRouter.put("/learnerProgressById/:id", asyncRoute(learnerProgressSqlController.updateLearnerProgressById));

learnerProgressSqlRouter.put("/learnerProgressBysubsessionId/:id", asyncRoute(learnerProgressSqlController.updateLearnerProgressBysubsessionId));

learnerProgressSqlRouter.delete("/learnerProgressById/:id", asyncRoute(learnerProgressSqlController.deleteLearnerProgressById));

learnerProgressSqlRouter.delete("/learnerProgressByuserId/:id", asyncRoute(learnerProgressSqlController.deleteLearnerProgressByuserId));

learnerProgressSqlRouter.delete("/learnerProgressBysubsessionId/:id", asyncRoute(learnerProgressSqlController.deleteLearnerProgressBysubsessionId));

export default learnerProgressSqlRouter;