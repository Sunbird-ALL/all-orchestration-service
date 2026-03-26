import { Router } from "express";
import { asyncRoute } from "../../../common/middleware/api-error.middleware";
import BaselineController from "./baseline.controller";

const baselineRouter = Router();

baselineRouter.post("/addBaseline", asyncRoute(BaselineController.addBaseline));

baselineRouter.get("/getAssessmet/:studentId/:assessmentId?", asyncRoute(BaselineController.getBaseline));

export default baselineRouter;