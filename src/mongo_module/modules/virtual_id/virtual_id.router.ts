import { Router } from "express";
import virtualIdController from "./virtual_id.controller";
import validateApiKey from "../../middlewares/validate.apiKey";
const virtualIRouter = Router();

virtualIRouter.post("/generateVirtualID", validateApiKey, virtualIdController.genarateVirtualId);

export default virtualIRouter;