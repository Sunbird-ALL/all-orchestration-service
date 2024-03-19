import { Router } from "express";
import learnerProgressSqlController from "./learner_progress.controller";

const learnerProgressSqlRouter = Router();

learnerProgressSqlRouter.post("/createLearnerProgress", learnerProgressSqlController.addLearnerProgress);

learnerProgressSqlRouter.get("/latestLearnerProgress/:id", learnerProgressSqlController.getLatestLearnerProgressById);

learnerProgressSqlRouter.get("/learnerProgressById/:id", learnerProgressSqlController.getLearnerProgressById);

learnerProgressSqlRouter.get("/learnerProgressByuserId/:id", learnerProgressSqlController.getLearnerProgressByuserId);

learnerProgressSqlRouter.get("/learnerProgressBysessionId/:id", learnerProgressSqlController.getLearnerProgressBysessionId);

learnerProgressSqlRouter.get("/learnerProgressBysubsessionId/:id", learnerProgressSqlController.getLearnerProgressBysubsessionId);

learnerProgressSqlRouter.put("/learnerProgressById/:id", learnerProgressSqlController.updateLearnerProgressById);

learnerProgressSqlRouter.put("/learnerProgressBysubsessionId/:id", learnerProgressSqlController.updateLearnerProgressBysubsessionId);

learnerProgressSqlRouter.delete("/learnerProgressById/:id", learnerProgressSqlController.deleteLearnerProgressById);

learnerProgressSqlRouter.delete("/learnerProgressByuserId/:id", learnerProgressSqlController.deleteLearnerProgressByuserId);

learnerProgressSqlRouter.delete("/learnerProgressBysubsessionId/:id", learnerProgressSqlController.deleteLearnerProgressBysubsessionId);

export default learnerProgressSqlRouter;