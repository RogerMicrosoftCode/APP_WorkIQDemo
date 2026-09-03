import { describe, expect, it } from "vitest";
import { parseAskResult } from "./workIqService.js";

describe("parseAskResult", () => {
  it("parses the remote MCP JSON text response", () => {
    const result = parseAskResult([
      { type: "text", text: JSON.stringify({ response: "Remote answer", conversationId: "remote-id" }) },
    ]);

    expect(result).toEqual({ response: "Remote answer", conversationId: "remote-id" });
  });

  it("parses local CLI Markdown with structured conversation metadata", () => {
    const result = parseAskResult(
      [{ type: "text", text: "You have **three meetings** today." }],
      { conversationId: "local-id" },
    );

    expect(result).toEqual({
      response: "You have **three meetings** today.",
      conversationId: "local-id",
    });
  });
});