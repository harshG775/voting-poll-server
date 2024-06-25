import { Request, Response, NextFunction } from "express";
import { prisma } from "../db/prisma";
import { User } from "@prisma/client";
import { clientError } from "../utils/httpStatus";
import ApiError from "../errors/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
declare module "express-serve-static-core" {
    interface Request {
        user: User;
    }
}

const userAuth = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;

        if (!authHeader || typeof authHeader !== "string") {
            throw new ApiError(
                clientError.Unauthorized,
                "Authorization header missing or invalid"
            );
        }

        const refreshToken: string = authHeader.split(" ")[1];

        if (!refreshToken) {
            throw new ApiError(clientError.Unauthorized, "Token missing");
        }

        const user = await prisma.user.findUnique({
            where: { refreshToken: refreshToken },
        });

        if (!user) {
            throw new ApiError(clientError.Unauthorized, "User not found");
        }

        req.user = user;
        next();
    }
);

export default userAuth;
