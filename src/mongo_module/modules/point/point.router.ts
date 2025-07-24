import { Router } from "express";
import pointerController from "./point.controller";
import validateApiKey from "../../middlewares/validate.apiKey";

const pointerRouter = Router();

pointerRouter.post("/addPoints", validateApiKey, pointerController.addPoint);

pointerRouter.get("/getPoints/:userId/:sessionId", pointerController.getPointsByUserId);

export default pointerRouter;