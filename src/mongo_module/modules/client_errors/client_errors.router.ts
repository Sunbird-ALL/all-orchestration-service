import { Router } from "express";
import { asyncRoute } from "../../../common/middleware/api-error.middleware";
import ClientErrorsController from "./client_errors.controller";

const clientErrorsRouter = Router();

clientErrorsRouter.post("/", asyncRoute(ClientErrorsController.create));

export default clientErrorsRouter;
