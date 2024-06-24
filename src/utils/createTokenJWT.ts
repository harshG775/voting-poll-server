import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

import { env } from "../lib/env";
const JWT_SECRET = env.JWT_SECRET;

type CreateTokenType = {
    tokenType: "refreshToken" | "accessToken";
    user: {
        username: string;
        email: string;
        password: string;
    };
};
export default async function createToken({ tokenType, user, }: CreateTokenType): Promise<string> {
    if (tokenType === "refreshToken") {
        return jwt.sign(
            {
                username: user.username,
                email: user.email,
                password: user.password,
            },
            JWT_SECRET
        );
    }
    return jwt.sign(
        {
            username: user.username,
            email: user.email,
            password: user.password,
        },
        JWT_SECRET,
        {
            expiresIn: "7d",
        }
    );
}
