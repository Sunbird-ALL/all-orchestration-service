import { Router } from "express";
import { asyncRoute } from "../../../common/middleware/api-error.middleware";
import virtualIdController from "./virtual_id.controller";
const virtualIRouter = Router();

virtualIRouter.post("/generateVirtualID", asyncRoute(virtualIdController.genarateVirtualId));

virtualIRouter.post("/tokenStatus", asyncRoute(virtualIdController.tokenStatus));

export default virtualIRouter;