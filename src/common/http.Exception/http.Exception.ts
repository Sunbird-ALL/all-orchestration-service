import type { ValidationError } from 'joi';

export type FieldError = {
    field: string;
    message: string;
    code?: string;
};

export type HttpExceptionOptions = {
    errorType?: string;
    errors?: FieldError[];
    code?: string;
};

class HttpException extends Error {
    status: number;
    override message: string;
    errorType: string;
    errors?: FieldError[];
    code?: string;

    constructor(status: number, message: string, options?: HttpExceptionOptions) {
        super(message);
        this.name = 'HttpException';
        this.status = status;
        this.message = message;
        this.errorType = options?.errorType ?? HttpException.inferErrorType(status);
        this.errors = options?.errors;
        this.code = options?.code;
        Object.setPrototypeOf(this, HttpException.prototype);
    }

    private static inferErrorType(status: number): string {
        if (status === 400) return 'BadRequest';
        if (status === 401) return 'AuthenticationError';
        if (status === 403) return 'AuthorizationError';
        if (status === 404) return 'NotFoundError';
        if (status >= 500) return 'InternalServerError';
        return 'HttpError';
    }

    static fromJoi(validationError: ValidationError): HttpException {
        const first = validationError.details[0];
        const summary =
            first?.message?.replace(/"/g, '') || 'Validation failed';
        return new HttpException(400, summary, {
            errorType: 'ValidationError',
            code: 'VALIDATION_FAILED',
            errors: validationError.details.map((d) => ({
                field:
                    d.path.length > 0
                        ? d.path.join('.')
                        : String(d.context?.key ?? '(root)'),
                message: d.message,
                code: d.type,
            })),
        });
    }

    toJSON() {
        return {
            status: this.status,
            message: this.message,
            error_type: this.errorType,
            ...(this.errors?.length ? { errors: this.errors } : {}),
            ...(this.code ? { code: this.code } : {}),
        };
    }
}

export default HttpException;
