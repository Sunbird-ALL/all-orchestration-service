import { NextFunction, Request, Response } from "express";
import { toHttpException } from "../../../common/middleware/api-error.middleware";
import clientErrorsService from "./client_errors.services";

class ClientErrorsController {
    static async create(request: Request, response: Response, next: NextFunction) {
        try {
            const payload = { ...request.body, receivedAt: new Date() };
            await clientErrorsService.recordClientError(payload);

            console.error(
                JSON.stringify({
                    level: "error",
                    source: "frontend",
                    type: payload.type || "unknown",
                    message: payload.message || "",
                    url: payload.url || "",
                    stack: payload.stack || "",
                    ts: payload.ts,
                    receivedAt: payload.receivedAt,
                }),
            );

            response.status(201).json({ ok: true });
        } catch (err) {
            next(toHttpException(err));
        }
    }
}

export default ClientErrorsController;
