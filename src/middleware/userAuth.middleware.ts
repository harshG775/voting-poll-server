import { Request, Response, NextFunction } from "express";
import { prisma } from "../db/prisma";
import { User } from "@prisma/client";
import { clientError } from "../utils/httpStatus";

declare module "express-serve-static-core" {
    interface Request {
        user: User;
    }
}

const userAuth = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || typeof authHeader !== "string") {
        return res
            .status(clientError.Unauthorized)
            .json({ error: "Authorization header missing or invalid" });
    }

    const refreshToken: string = authHeader.split(" ")[1];

    if (!refreshToken) {
        return res
            .status(clientError.Unauthorized)
            .json({ error: "Token missing" });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { refreshToken: refreshToken },
        });

        if (!user) {
            return res
                .status(clientError.Unauthorized)
                .json({ error: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Error authenticating user:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export default userAuth;
