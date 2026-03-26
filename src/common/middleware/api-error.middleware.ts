import { randomUUID } from 'crypto';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import HttpException from '../http.Exception/http.Exception';

type RequestWithId = Request & {
    requestId: string;
};

export type ApiErrorBody = {
    success: false;
    message: string;
    error_type: string;
    errors?: { field: string; message: string; code?: string }[];
    timestamp: string;
    request_id: string;
    code?: string;
};

export function requestIdMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction,
): void {
    const request = req as RequestWithId;
    const headerId = req.header('x-request-id');
    request.requestId =
        typeof headerId === 'string' && headerId.trim().length > 0
            ? headerId.trim()
            : randomUUID();
    next();
}

export function toHttpException(err: unknown): HttpException {
    if (err instanceof HttpException) {
        return err;
    }
    if (err instanceof Error) {
        return new HttpException(500, err.message, {
            errorType: 'InternalServerError',
            code: 'UNHANDLED_ERROR',
        });
    }
    if (typeof err === 'string') {
        return new HttpException(400, err, {
            errorType: 'BadRequest',
            code: 'BAD_REQUEST',
        });
    }
    return new HttpException(500, 'Internal server error', {
        errorType: 'InternalServerError',
        code: 'UNHANDLED_ERROR',
    });
}

export function buildApiErrorBody(
    httpError: HttpException,
    req: Request,
): ApiErrorBody {
    const request = req as RequestWithId;
    const body: ApiErrorBody = {
        success: false,
        message: httpError.message,
        error_type: httpError.errorType,
        timestamp: new Date().toISOString(),
        request_id: request.requestId,
    };
    if (httpError.errors?.length) {
        body.errors = httpError.errors;
    }
    if (httpError.code) {
        body.code = httpError.code;
    }
    return body;
}

export function logStructuredApiError(
    httpError: HttpException,
    req: Request,
): void {
    const request = req as RequestWithId;
    const logRecord = {
        level: 'error',
        event: 'api_error',
        request_id: request.requestId,
        method: req.method,
        path: req.originalUrl || req.url,
        status: httpError.status,
        error_type: httpError.errorType,
        message: httpError.message,
        code: httpError.code ?? null,
        ...(httpError.errors?.length ? { errors: httpError.errors } : {}),
        stack: httpError.stack ?? null,
    };
    console.error(JSON.stringify(logRecord));
}

export function handleErrorForResponse(
    res: Response,
    req: Request,
    err: unknown,
): void {
    const httpError = toHttpException(err);
    logStructuredApiError(httpError, req);
    const body = buildApiErrorBody(httpError, req);
    if (!res.headersSent) {
        res.status(httpError.status).json(body);
    }
}

export function globalErrorHandler(
    err: unknown,
    req: Request,
    res: Response,
    _next: NextFunction,
): void {
    handleErrorForResponse(res, req, err);
}

export function notFoundHandler(
    req: Request,
    _res: Response,
    next: NextFunction,
): void {
    next(
        new HttpException(
            404,
            `Cannot ${req.method} ${req.originalUrl || req.url}`,
            {
                errorType: 'NotFoundError',
                code: 'ROUTE_NOT_FOUND',
            },
        ),
    );
}

export function asyncRoute(fn: RequestHandler): RequestHandler {
    return function asyncRouteWrapped(req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
