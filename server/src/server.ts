// server.ts
//
// Entry point — the ONLY place that calls app.listen().
// Everything else (middleware, routes, error handlers) lives in app.ts.
//
// To run:  npm run dev   (tsx watch — restarts on file changes)
//          npm start     (tsx — no watching, for production-like runs)

import { env } from "./config/env";
import { logger } from "./utils/logger";
import { createApp } from "./app";

const app = createApp();

app.listen(env.PORT, "0.0.0.0", () => {
  logger.info(`Server listening on port ${env.PORT}  [${env.NODE_ENV}]`);
});
