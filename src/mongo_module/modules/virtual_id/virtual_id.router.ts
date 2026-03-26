import { Router } from "express";
import { asyncRoute } from "../../../common/middleware/api-error.middleware";
import virtualIdController from "./virtual_id.controller";
const virtualIRouter = Router();

virtualIRouter.post("/generateVirtualID", asyncRoute(virtualIdController.genarateVirtualId));

virtualIRouter.post("/logout", asyncRoute(virtualIdController.logout));

virtualIRouter.post("/tokenStatus", asyncRoute(virtualIdController.tokenStatus));

virtualIRouter.delete("/deleteByVirtualId", asyncRoute(virtualIdController.deleteByVirtualId));

// New route for processing Excel files with tokens
virtualIRouter.post("/processExcelTokens", asyncRoute(virtualIdController.processExcelTokens));

export default virtualIRouter;