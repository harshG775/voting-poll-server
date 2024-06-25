import { Router } from "express";
import { createPoll, deletePoll, getPoll, getPolls } from "../controllers/poll.controller";
const router = Router();

router.route("/").post(createPoll);
router.route("/").get(getPolls);
router.route("/:pollId").get(getPoll);
router.route("/:pollId").delete(deletePoll);



// vote
router.route("/:id/vote").post();

export default router;
