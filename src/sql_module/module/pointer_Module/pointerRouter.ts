import { Router } from "express";
import { asyncRoute } from "../../../common/middleware/api-error.middleware";
import pointerController from "./pointerController";

const pointerSqlRouter = Router();

pointerSqlRouter.post("/addPoints", asyncRoute(pointerController.addPointer));

pointerSqlRouter.get("/getPoints/:userId/:sessionId", asyncRoute(pointerController.getPointersByUserId));

export default pointerSqlRouter;