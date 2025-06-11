import { Router } from "express";
import virtualIdController from "./virtual_id.controller";
const virtualIRouter = Router();

virtualIRouter.post("/generateVirtualID", virtualIdController.genarateVirtualId);

virtualIRouter.post("/logout", virtualIdController.logout);

export default virtualIRouter;