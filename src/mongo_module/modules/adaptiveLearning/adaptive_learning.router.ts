import { Router } from "express";
import AdaptiveLearningController from "./adaptive_learning.controller";


const adaptiveLearningRouter = Router();

adaptiveLearningRouter.post("/addSchoolUdise", AdaptiveLearningController.addSchoolUdise);

adaptiveLearningRouter.get("/validateUdise/:udise_code", AdaptiveLearningController.validateUdise);

adaptiveLearningRouter.delete("/deleteByUdise/:udise_code", AdaptiveLearningController.deleteUdise);

adaptiveLearningRouter.get("/getAllUdise", AdaptiveLearningController.getAllUdeise);


export default adaptiveLearningRouter;