import { Router } from "express";
import pointerController from "./point.controller";

const pointerRouter = Router();

pointerRouter.post("/addPoints", pointerController.addPoint);

pointerRouter.get("/getPoints/:userId/:sessionId", pointerController.getPointsByUserId);

export default pointerRouter;