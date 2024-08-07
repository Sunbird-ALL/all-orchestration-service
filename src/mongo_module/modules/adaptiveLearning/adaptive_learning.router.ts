import { Router } from "express";
import adaptiveLearningController from "./adaptive_learning.controller";


const adaptiveLearningRouter = Router();

adaptiveLearningRouter.post("/addSchoolUdise", adaptiveLearningController.addSchoolUdise);

adaptiveLearningRouter.get("/validateUdise/:udise_code", adaptiveLearningController.validateUdise);

adaptiveLearningRouter.delete("/deleteUdise/:_id", adaptiveLearningController.deleteUdise);

adaptiveLearningRouter.get("/getAllUdise", adaptiveLearningController.getAllUdeise);


export default adaptiveLearningRouter;