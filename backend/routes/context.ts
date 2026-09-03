import { Router } from "express";
import { env } from "../config/env.js";

export const contextRouter = Router();

contextRouter.get("/", (request, response) => {
  const user = request.user!;
  const isDemo = env.workIqMode === "demo";
  const isLocal = env.workIqMode === "local";
  response.json({
    mode: env.workIqMode,
    user: {
      name: user.name,
      email: user.email,
      tenantId: user.tenantId,
      tenantName: env.TENANT_DISPLAY_NAME,
    },
    status: {
      authentication: isDemo
        ? "Demo identity"
        : isLocal
          ? "Interactive Entra sign-in through Work IQ CLI"
          : "Authenticated with Microsoft Entra ID",
      license: "No separate Work IQ license required",
      workIqAccess: isDemo
        ? "Demo mode"
        : isLocal
          ? "Local MCP via @microsoft/workiq"
          : "Remote delegated access configured",
      billingMethod: "Copilot Credits (tenant policy)",
      copilotCredits: "Balance is not exposed by a public runtime API",
      userContext: isDemo
        ? "Synthetic Microsoft 365 data"
        : isLocal
          ? "Work IQ CLI signed-in user's permissions"
          : "Signed-in user's Microsoft 365 permissions",
    },
  });
});
