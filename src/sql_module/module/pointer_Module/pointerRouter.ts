import { Router } from "express";
import pointerController from "./pointerController";

const pointerSqlRouter = Router();

pointerSqlRouter.post("/addPoints", pointerController.addPointer);

pointerSqlRouter.get("/getPoints/:userId/:sessionId", pointerController.getPointersByUserId);

export default pointerSqlRouter;