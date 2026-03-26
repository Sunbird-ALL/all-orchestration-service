import { Router } from "express";
import verifyToken from '../../middlewares/verify.token';
import { asyncRoute } from "../../../common/middleware/api-error.middleware";
import pointerController from "./point.controller";

const pointerRouter = Router();

pointerRouter.post("/addPoints", verifyToken, asyncRoute(pointerController.addPoint));

pointerRouter.get("/getPoints/:sessionId", verifyToken, asyncRoute(pointerController.getPointsByUserId));

export default pointerRouter;