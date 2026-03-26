import { Router } from "express";
import { asyncRoute } from "../../../common/middleware/api-error.middleware";
import virtualIdSqlController from "./virtual_id.controller";

const virtualIdSqlRouter = Router();

virtualIdSqlRouter.post("/generateVirtualID", asyncRoute(virtualIdSqlController.genarateVirtualId));

export default virtualIdSqlRouter;