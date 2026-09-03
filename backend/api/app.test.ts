import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "./app.js";

describe("Work IQ Demo Console API", () => {
  it("reports API health", async () => {
    const response = await request(app).get("/api/health").expect(200);
    expect(response.body).toEqual({ status: "ok", mode: "demo" });
  });

  it("returns the synthetic user context in demo mode", async () => {
    const response = await request(app).get("/api/context").expect(200);
    expect(response.body.mode).toBe("demo");
    expect(response.body.user.email).toBeTruthy();
    expect(response.body.status.workIqAccess).toBe("Demo mode");
  });

  it("validates questions before invoking Work IQ", async () => {
    const response = await request(app).post("/api/ask").send({ question: "" }).expect(400);
    expect(response.body.error).toBe("invalid_request");
  });

  it("returns a clearly labeled synthetic answer", async () => {
    const response = await request(app)
      .post("/api/ask")
      .send({ question: "What needs my attention today?", timeZone: "America/Los_Angeles" })
      .expect(200);

    expect(response.body.mode).toBe("demo");
    expect(response.body.grounded).toBe(false);
    expect(response.body.answer).toContain("synthetic demo data");
  });
});