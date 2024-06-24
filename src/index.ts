import app from "./app";
import { env } from "./lib/env";
import { createLogger } from "./utils/logger";
const port = Number(env.PORT) || 4000;
(async () => {
    try {
        app.listen(port, () => {
            createLogger().info(`Server running at http://localhost:${port}`);
        });
    } catch (error) {
        createLogger().error("Failed to start server");
        console.log(error);
        process.exit(1);
    }
})();
