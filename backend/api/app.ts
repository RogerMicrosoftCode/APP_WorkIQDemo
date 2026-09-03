import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import helmet from "helmet";
import { env } from "../config/env.js";
import { requireAuth } from "../middleware/auth.js";
import { askRouter } from "../routes/ask.js";
import { contextRouter } from "../routes/context.js";

export const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: false }));
app.use(express.json({ limit: "32kb" }));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", mode: env.workIqMode });
});
app.use("/api/context", requireAuth, contextRouter);
app.use("/api/ask", requireAuth, askRouter);

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  const message = env.NODE_ENV === "development" && error instanceof Error
    ? error.message
    : "The request could not be completed.";
  response.status(502).json({ error: "work_iq_error", message });
};

app.use(errorHandler);
