import { Router } from "express";
import BaselineController from "./baseline.controller";
import validateApiKey from "../../middlewares/validate.apiKey";

const baselineRouter = Router();

baselineRouter.post("/addBaseline", validateApiKey, BaselineController.addBaseline);

baselineRouter.get("/getAssessmet/:studentId/:assessmentId?", BaselineController.getBaseline);

export default baselineRouter;