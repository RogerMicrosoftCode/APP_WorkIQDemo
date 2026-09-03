import { resolve } from "node:path";
import { config } from "dotenv";
import { z } from "zod";

config({
  path: [resolve(process.cwd(), ".env"), resolve(process.cwd(), "../.env")],
  quiet: true,
});

const schema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(3001),
    CORS_ORIGIN: z.string().default("http://localhost:5173"),
    WORK_IQ_MODE: z.enum(["demo", "local", "remote"]).default("demo"),
    ENTRA_API_CLIENT_ID: z.string().optional(),
    ENTRA_CLIENT_SECRET: z.string().optional(),
    ENTRA_CERT_THUMBPRINT: z.string().optional(),
    ENTRA_CERT_PRIVATE_KEY: z.string().optional(),
    ALLOWED_TENANT_IDS: z.string().default(""),
    TENANT_DISPLAY_NAME: z.string().default("Microsoft"),
    DISPLAY_USER_NAME: z.string().min(1).default("Local Work IQ user"),
    DISPLAY_USER_EMAIL: z.email().default("user@example.com"),
    DISPLAY_TENANT_ID: z.string().min(1).default("local-tenant"),
    WORK_IQ_LOCAL_ACCOUNT: z.email().optional(),
    WORK_IQ_MCP_ENDPOINT: z
      .url()
      .default("https://workiq.svc.cloud.microsoft/mcp"),
    WORK_IQ_SCOPE: z
      .string()
      .default("api://workiq.svc.cloud.microsoft/WorkIQAgent.Ask"),
    WORK_IQ_TIMEOUT_MS: z.coerce.number().int().min(1_000).max(180_000).default(90_000),
  })
  .superRefine((value, context) => {
    if (value.WORK_IQ_MODE !== "remote") return;

    if (!value.ENTRA_API_CLIENT_ID) {
      context.addIssue({ code: "custom", path: ["ENTRA_API_CLIENT_ID"], message: "Required in live mode" });
    }

    const hasSecret = Boolean(value.ENTRA_CLIENT_SECRET);
    const hasCertificate = Boolean(value.ENTRA_CERT_THUMBPRINT && value.ENTRA_CERT_PRIVATE_KEY);
    if (!hasSecret && !hasCertificate) {
      context.addIssue({
        code: "custom",
        path: ["ENTRA_CLIENT_SECRET"],
        message: "Provide a client secret or certificate credentials in live mode",
      });
    }
  });

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid environment configuration: ${z.prettifyError(parsed.error)}`);
}

export const env = {
  ...parsed.data,
  workIqMode: parsed.data.WORK_IQ_MODE,
  allowedTenantIds: parsed.data.ALLOWED_TENANT_IDS.split(",")
    .map((tenantId) => tenantId.trim().toLowerCase())
    .filter(Boolean),
};
