import { Router } from "express";
import { z } from "zod";
import { askWorkIq } from "../services/workIqService.js";

const requestSchema = z.object({
  question: z.string().trim().min(2).max(8_000),
  conversationId: z.string().trim().max(256).optional(),
  timeZone: z.string().trim().max(100).optional(),
});

export const askRouter = Router();

askRouter.post("/", async (request, response, next) => {
  const parsed = requestSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "invalid_request", message: "Enter a question between 2 and 8,000 characters." });
    return;
  }

  try {
    response.json(await askWorkIq(parsed.data, request.user!));
  } catch (error) {
    next(error);
  }
});
