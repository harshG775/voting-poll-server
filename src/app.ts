import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import { env } from "./lib/env";
const app = express();

app.use(
    cors({
        origin: env.CORS_ORIGINS.split(","),
        credentials: true,
    })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(morgan("dev"));

// middleware
import userAuth from "./middleware/userAuth.middleware";

app.use("/api/v1/polls", userAuth);

// routes import
import welcomeRoute from "./routes/welcome.route";
import userRouter from "./routes/user.route";
import router from "./routes/poll.route";

app.use("/api/", welcomeRoute);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/polls", router);


export default app;
