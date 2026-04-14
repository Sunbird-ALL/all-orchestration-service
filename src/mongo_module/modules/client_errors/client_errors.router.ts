import { Router, Request, Response } from "express";
import { asyncRoute, handleErrorForResponse } from "../../../common/middleware/api-error.middleware";
import ClientError from "../../models/clientError";

const clientErrorsRouter = Router();

clientErrorsRouter.post(
    "/",
    asyncRoute(async (req: Request, res: Response) => {
        const payload = { ...req.body, receivedAt: new Date() };
        await ClientError.create(payload);

        // Log to stdout so Promtail → Loki → Grafana can see frontend errors
        console.error(JSON.stringify({
            level: "error",
            source: "frontend",
            type: payload.type || "unknown",
            message: payload.message || "",
            url: payload.url || "",
            stack: payload.stack || "",
            ts: payload.ts,
            receivedAt: payload.receivedAt,
        }));

        res.status(201).json({ ok: true });
    }),
);

export default clientErrorsRouter;
