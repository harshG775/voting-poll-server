import { Request, Response } from "express";
import { asyncPromiseHandler } from "../utils/asyncHandler";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { clientError, success } from "../utils/httpStatus";

export const prisma = new PrismaClient();
const pollSchema = z.object({
    title: z.string(),
    options: z
        .array(
            z.object({
                text: z.string(),
            })
        )
        .nonempty(),
    votingStartsAt: z.string().optional(),
    votingEndsAt: z.string().optional(),
});
export const createPoll = asyncPromiseHandler(
    async (req: Request, res: Response) => {
        const user = req.user;
        const poll = req.body.poll;
        
        const pollData = pollSchema.safeParse(poll);
        if (!pollData.success) {
            return res.status(clientError.BadRequest).json({
                message: pollData.error?.errors[0].message,
            });
        }

        const newPoll = await prisma.poll.create({
            data: {
                title: poll.title,
                votingStartsAt: poll.votingStartsAt
                    ? new Date(poll.votingStartsAt)
                    : undefined,
                votingEndsAt: poll.votingEndsAt
                    ? new Date(poll.votingEndsAt)
                    : undefined,
                createdBy: { connect: { id: user.id } },
                options: {
                    create: poll.options.map((option: { text: string }) => ({
                        title: option.text,
                    })),
                },
            },
            include: {
                options: true,
            },
        });
        
        if (newPoll === null) {
            return res.status(clientError.Conflict).json({
                message: "Poll was not created",
            });
        }

        return res.status(success.Created).json({
            message: "Poll was created",
            data: newPoll,
        });

    }
);
