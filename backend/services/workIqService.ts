import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { env } from "../config/env.js";
import type { AuthenticatedUser } from "../types/express.js";
import { acquireWorkIqToken } from "./tokenService.js";

export type AskInput = {
  conversationId?: string;
  question: string;
  timeZone?: string;
};

export type AskResult = {
  answer: string;
  conversationId?: string;
  durationMs: number;
  grounded: boolean;
  mode: "demo" | "local" | "remote";
};

function demoAnswer(question: string): string {
  return [
    `Based on your demo Microsoft 365 context, here is a grounded summary for **“${question}”**:`,
    "",
    "- The Northwind renewal is the highest-priority item this week; the account team is waiting for final pricing approval.",
    "- Your next relevant meeting is **Northwind account review** today at 2:00 PM with Sales and Finance.",
    "- Two unread messages mention a Friday decision deadline and an updated commercial proposal.",
    "",
    "This response uses synthetic demo data. Connect Microsoft Entra ID and Work IQ to query the signed-in user’s organization.",
  ].join("\n");
}

export function parseAskResult(
  content: unknown,
  structuredContent?: unknown,
): { response: string; conversationId?: string } {
  if (!Array.isArray(content)) throw new Error("Work IQ returned an unsupported response");

  const textBlock = content.find(
    (item): item is { type: "text"; text: string } =>
      typeof item === "object" && item !== null && "type" in item && item.type === "text" &&
      "text" in item && typeof item.text === "string",
  );
  if (!textBlock) throw new Error("Work IQ returned no text content");

  const structuredConversationId =
    typeof structuredContent === "object" && structuredContent !== null &&
    "conversationId" in structuredContent && typeof structuredContent.conversationId === "string"
      ? structuredContent.conversationId
      : undefined;

  try {
    const parsed: unknown = JSON.parse(textBlock.text);
    if (typeof parsed === "object" && parsed !== null && "response" in parsed && typeof parsed.response === "string") {
      return {
        response: parsed.response,
        conversationId:
          "conversationId" in parsed && typeof parsed.conversationId === "string"
            ? parsed.conversationId
            : structuredConversationId,
      };
    }
  } catch {
    // The local Work IQ CLI returns Markdown text directly.
  }

  return {
    response: textBlock.text,
    conversationId: structuredConversationId,
  };
}

export async function askWorkIq(input: AskInput, user: AuthenticatedUser): Promise<AskResult> {
  const startedAt = performance.now();

  if (env.workIqMode === "demo") {
    await new Promise((resolve) => setTimeout(resolve, 650));
    return {
      answer: demoAnswer(input.question),
      conversationId: input.conversationId ?? "demo-conversation",
      durationMs: Math.round(performance.now() - startedAt),
      grounded: false,
      mode: "demo",
    };
  }

  const client = new Client({ name: "work-iq-demo-console", version: "1.0.0" });
  const transport = env.workIqMode === "local"
    ? new StdioClientTransport({
        command: process.platform === "win32" ? "npx.cmd" : "npx",
        args: [
          "-y",
          "@microsoft/workiq@1.0.0",
          "mcp",
          ...(env.WORK_IQ_LOCAL_ACCOUNT
            ? ["--account", env.WORK_IQ_LOCAL_ACCOUNT]
            : []),
        ],
        stderr: "inherit",
      })
    : new StreamableHTTPClientTransport(new URL(env.WORK_IQ_MCP_ENDPOINT), {
        authProvider: {
          token: async () => acquireWorkIqToken(user.accessToken, user.tenantId),
        },
        onInsufficientScope: "throw",
      });

  try {
    await client.connect(transport);
    const result = await client.callTool(
      {
        name: "ask",
        arguments: {
          question: input.question,
          ...(input.conversationId ? { conversationId: input.conversationId } : {}),
          ...(input.timeZone ? { timeZone: input.timeZone } : {}),
        },
      },
      { timeout: env.WORK_IQ_TIMEOUT_MS },
    );

    if (result.isError) throw new Error("Work IQ could not complete the request");
    const parsed = parseAskResult(result.content, result.structuredContent);
    return {
      answer: parsed.response,
      conversationId: parsed.conversationId,
      durationMs: Math.round(performance.now() - startedAt),
      grounded: true,
      mode: env.workIqMode,
    };
  } catch (error) {
    if (env.workIqMode === "local") {
      throw new Error(
        "The local Work IQ CLI could not complete the request. Run npm run workiq:accept-eula, npm run workiq:login, and npm run workiq:test before retrying.",
        { cause: error },
      );
    }
    throw error;
  } finally {
    await client.close().catch(() => undefined);
  }
}
