import dotenv from "dotenv";
import { z } from "zod";
dotenv.config({
    path: "./.env",
});
const envSchema = z.object({
    PORT: z.string(),
    DATABASE_URL: z.string(),
    JWT_SECRET: z.string(),
    CORS_ORIGINS: z.string(),
});

export const env = envSchema.parse(process.env);
