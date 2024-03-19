import { Router } from "express";
import virtualIdSqlController from "./virtual_id.controller";

const virtualIdSqlRouter = Router();

virtualIdSqlRouter.post("/generateVirtualID", virtualIdSqlController.genarateVirtualId);

export default virtualIdSqlRouter;