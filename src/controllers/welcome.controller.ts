import { Request, Response } from "express";

export const welcome = async (req: Request, res: Response) => {
    res.status(200).send({
        message: "welcome to version 1.0.0 of the api",
        version: "1.0.0",
    });
};
