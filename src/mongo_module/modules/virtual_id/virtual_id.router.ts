import { Router } from "express";
import virtualIdController from "./virtual_id.controller";
const virtualIRouter = Router();

virtualIRouter.post("/generateVirtualID", virtualIdController.genarateVirtualId);

virtualIRouter.post("/logout", virtualIdController.logout);

virtualIRouter.post("/tokenStatus", virtualIdController.tokenStatus);

virtualIRouter.delete("/deleteByUserName", virtualIdController.deleteByUserName);

// New route for processing Excel files with tokens
virtualIRouter.post("/processExcelTokens", virtualIdController.processExcelTokens);

export default virtualIRouter;