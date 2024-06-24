import { Request, Response, NextFunction } from "express";
// asyncHandler: Use this if you want to directly handle errors and send a custom response without relying on centralized error handling.
export const asyncHandler = (fn: any) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await fn(req, res, next);
        } catch (error: any) {
            console.log(error);
            res.status(error.code || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    };
};

// asyncPromiseHandler: Use this if you prefer a centralized error handling approach and have middleware designed to handle errors globally.
export const asyncPromiseHandler = (fn: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch((error: any) => next(error));
    };
};
