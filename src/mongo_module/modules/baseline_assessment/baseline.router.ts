import { Router } from "express";
import BaselineController from "./baseline.controller";

const baselineRouter = Router();

baselineRouter.post("/addBaseline", BaselineController.addBaseline);

baselineRouter.get("/getAssessmet/:studentId/:assessmentId?", BaselineController.getBaseline);

export default baselineRouter;