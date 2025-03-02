import { Router } from "express";
import pointerController from "./point.controller";
import versionedAuth from "../../middlewares/versionedAuth";

const pointerRouter = Router();

pointerRouter.post("/addPoints", versionedAuth, pointerController.addPoint);

pointerRouter.get("/getPoints/:userId?/:sessionId", versionedAuth, pointerController.getPointsByUserId);

export default pointerRouter;