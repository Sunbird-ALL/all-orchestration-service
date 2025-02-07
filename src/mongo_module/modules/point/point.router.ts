import { Router } from "express";
import verifyToken from '../../middlewares/verify.token';
import pointerController from "./point.controller";

const pointerRouter = Router();

pointerRouter.post("/addPoints", verifyToken, pointerController.addPoint);

pointerRouter.get("/getPoints/:sessionId", verifyToken, pointerController.getPointsByUserId);

export default pointerRouter;