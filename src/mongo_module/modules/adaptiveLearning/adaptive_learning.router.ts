import { Router } from "express";
import { asyncRoute } from "../../../common/middleware/api-error.middleware";
import AdaptiveLearningController from "./adaptive_learning.controller";


const adaptiveLearningRouter = Router();

adaptiveLearningRouter.post("/addSchoolUdise", asyncRoute(AdaptiveLearningController.addSchoolUdise));

adaptiveLearningRouter.get("/validateUdise/:udise_code", asyncRoute(AdaptiveLearningController.validateUdise));

adaptiveLearningRouter.delete("/deleteByUdise/:udise_code", asyncRoute(AdaptiveLearningController.deleteUdise));

adaptiveLearningRouter.get("/getAllUdise", asyncRoute(AdaptiveLearningController.getAllUdeise));


export default adaptiveLearningRouter;