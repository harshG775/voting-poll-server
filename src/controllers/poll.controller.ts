import { Request, Response } from "express";
import { asyncHandler, asyncPromiseHandler } from "../utils/asyncHandler";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { clientError, success } from "../utils/httpStatus";
import ApiError from "../errors/ApiError";

export const prisma = new PrismaClient();
// poll
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
            throw new ApiError(
                clientError.BadRequest,
                pollData.error?.errors[0].message
            );
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
            throw new ApiError(clientError.Conflict, "Poll was not created");
        }

        return res.status(success.Created).json({
            message: "Poll was created",
            data: newPoll,
        });
    }
);

export const getPolls = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    const { offset, limit, order } = req.query; //?offset=0&limit=10&order=asc
    let polls = null;
    if (offset && !limit) {
        polls = await prisma.poll.findMany({
            where: {
                createdBy: { id: user.id },
            },
            skip: 0,
            take: 10,
        });
    }
    polls = await prisma.poll.findMany({
        where: {
            createdBy: { id: user.id },
        },
        ...(offset && {
            skip: Number(offset),
        }),
        ...(limit && {
            take: Number(limit),
        }),
        orderBy: {
            ...(order && { createdAt: order === "asc" ? "asc" : "desc" }),
        },
    });
    if (polls === null) {
        throw new ApiError(clientError.NotFound, "Polls not found");
    }
    return res.status(success.OK).json({
        message: "Polls fetched",
        data: polls,
    });
});
export const getPoll = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    const pollId = req.params.pollId;
    const poll = await prisma.poll.findUnique({
        where: {
            id: pollId,
            createdById: user.id,
        },
        include: {
            options: true,
        },
    });

    if (poll === null) {
        throw new ApiError(clientError.NotFound, "Poll not found");
    }
    return res.status(success.OK).json({
        message: "Poll fetched",
        data: poll,
    });
});
export const deletePoll = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    const pollId = req.params.pollId;
    const poll = await prisma.poll.findUnique({
        where: {
            id: pollId,
            createdById: user.id,
        },
        include: {
            options: true,
        },
    });

    if (poll === null) {
        throw new ApiError(clientError.NotFound, "Poll not found");
    }

    const deletedPoll = await prisma.poll.delete({
        where: {
            id: pollId,
        },
        include: {
            options: true,
        },
    });

    if (deletedPoll === null) {
        throw new ApiError(clientError.NotFound, "Poll not found");
    }

    return res.status(success.OK).json({
        message: "Poll deleted",
        data: deletedPoll,
    });
});

// vote
export const createVote = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    const poll = req.body.poll;
    const option = req.body.option;
});
