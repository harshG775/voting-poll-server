// src/errors/ApiError.ts

interface ErrorDetails {
    message: string;
    field?: string;
}

class ApiError extends Error {
    public statusCode: number;
    public data: any;
    public success: boolean;
    public errors: ErrorDetails[];

    constructor(
        statusCode: number,
        message = "Internal Server Error",
        errors: ErrorDetails[] = [],
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export default ApiError;
