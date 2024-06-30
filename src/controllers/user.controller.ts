import { Request, Response } from "express";
import { PrismaClient, Role, User } from "@prisma/client";
import { z } from "zod";

import { success, clientError } from "../utils/httpStatus";
import { asyncHandler, asyncPromiseHandler } from "../utils/asyncHandler";
import ApiError from "../errors/ApiError";

export const prisma = new PrismaClient();
const userSchema = z.object({
    username: z
        .string()
        .min(3, { message: "Username must be at least 3 characters long" })
        .max(20, { message: "Username must be at most 20 characters long" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long" }),
});
export const register = asyncPromiseHandler(
    async (req: Request, res: Response) => {
        // user from frontEnd
        const { username, email, password } = req.body;
        //validate userFormData
        const user = userSchema.safeParse({ username, email, password });
        if (!user.success) {
            return res.status(clientError.Conflict).json({
                message: user.error?.errors[0].message,
            });
        }
        //check if user exists :username and email
        const isUserExists = await prisma.user.findFirst({
            where: {
                OR: [
                    {
                        username: user.data.username,
                    },
                    {
                        email: user.data.email,
                    },
                ],
            },
        });
        // create new user if user doesn't exist
        if (isUserExists === null) {
            const newUser = await createUser({
                avatar: null,
                username: user.data.username,
                email: user.data.email,
                password: user.data.password,
                role: Role.USER,
            });
            return res.status(success.Created).json({
                message: "new user registered",
                user: newUser,
            });
        }
        const emailExist = isUserExists.email === user.data.email;
        const usernameExist = isUserExists.username === user.data.username;
        return res.status(clientError.Conflict).json({
            message:
                emailExist && usernameExist
                    ? "User with that email and username already exists"
                    : emailExist
                    ? "User with that email already exists"
                    : usernameExist
                    ? "User with that username already exists"
                    : "something went wrong",
        });
    }
);

export const login = asyncPromiseHandler(
    async (req: Request, res: Response) => {
        // user from frontEnd
        const { email, password } = req.body;
        //validate userFormData
        const user = userSchema.safeParse({
            username: "123username",
            email,
            password,
        });
        if (!user.success) {
            return res.status(clientError.Conflict).json({
                message: user.error?.errors[0].message,
            });
        }
        //check if user exists :username and email
        const userExists = await prisma.user.findUnique({
            where: {
                email: user.data.email,
            },
        });
        if (userExists === null) {
            return res.status(clientError.Conflict).json({
                message: "User with that email doesn't exist",
            });
        }
        //check if password is correct
        const isPasswordCorrect = await bcrypt.compare(
            user.data.password,
            userExists.password
        );
        if (!isPasswordCorrect) {
            return res.status(clientError.Conflict).json({
                message: "Wrong password",
            });
        }
        //
        return res.status(success.OK).json({
            message: "user logged in",
            user: userExists,
        });
    }
);

export const userSession = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.body.token;
    if (!refreshToken) {
        throw new ApiError(clientError.Unauthorized, "Token missing");
    }

    const user = await prisma.user.findUnique({
        where: { refreshToken: refreshToken },
    });
    if (!user) {
        throw new ApiError(clientError.NotFound, "User not found");
    }
    if (!user.verified) {
        throw new ApiError(clientError.Unauthorized, "User not verified");
    }
    return res.status(success.OK).json({
        message: "user logged in",
        user: user,
    });
});

// Create
import bcrypt from "bcrypt";
import createToken from "../utils/createTokenJWT";
type CreateUserType = {
    avatar?: string | null;
    username: string;
    email: string;
    password: string;
    role?: Role | null;
    verified?: boolean;
};
const createUser = async ({
    avatar,
    username,
    email,
    password,
    role,
    verified,
}: CreateUserType): Promise<User> => {
    //create token
    const token = await createToken({
        tokenType: "refreshToken",
        user: {
            username: username,
            email: email,
            password: password,
        },
    });
    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    //create new user
    const newUser = await prisma.user.create({
        data: {
            avatar: avatar ? avatar : null,
            username,
            email,
            password: hashedPassword,
            role: role ? role : Role.USER,
            verified: verified ? verified : false,
            refreshToken: token,
        },
    });
    return newUser;
};
