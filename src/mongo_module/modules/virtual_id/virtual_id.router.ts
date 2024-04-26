import { Router } from "express";
import virtualIdController from "./virtual_id.controller";
const virtualIRouter = Router();

virtualIRouter.post("/generateVirtualID", virtualIdController.genarateVirtualId);

export default virtualIRouter;