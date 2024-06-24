import { Router } from "express";
import { welcome } from "../controllers/welcome.controller";
const router = Router();

router.route("/v1").get(welcome);

export default router;
