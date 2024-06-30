import { Router } from "express";
import { login, register, userSession } from "../controllers/user.controller";
const router = Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/session").get(userSession);

export default router;
