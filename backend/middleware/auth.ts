import type { NextFunction, Request, Response } from "express";
import { createRemoteJWKSet, decodeJwt, jwtVerify } from "jose";
import { env } from "../config/env.js";
import type { AuthenticatedUser } from "../types/express.js";

const jwksByTenant = new Map<string, ReturnType<typeof createRemoteJWKSet>>();
const tenantIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function configuredLocalUser(): AuthenticatedUser {
  return {
    accessToken: "demo-token",
    email: env.DISPLAY_USER_EMAIL,
    name: env.DISPLAY_USER_NAME,
    oid: "demo-user",
    tenantId: env.DISPLAY_TENANT_ID,
  };
}

function getJwks(tenantId: string) {
  const existing = jwksByTenant.get(tenantId);
  if (existing) return existing;

  const jwks = createRemoteJWKSet(
    new URL(`https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`),
  );
  jwksByTenant.set(tenantId, jwks);
  return jwks;
}

export async function requireAuth(request: Request, response: Response, next: NextFunction) {
  const authorization = request.header("authorization");

  if (env.workIqMode !== "remote" && !authorization) {
    request.user = configuredLocalUser();
    next();
    return;
  }

  const token = authorization?.match(/^Bearer (.+)$/i)?.[1];
  if (!token || !env.ENTRA_API_CLIENT_ID) {
    response.status(401).json({ error: "authentication_required", message: "Sign in is required." });
    return;
  }

  try {
    const unverified = decodeJwt(token);
    const tenantId = typeof unverified.tid === "string" ? unverified.tid.toLowerCase() : "";

    if (!tenantIdPattern.test(tenantId)) throw new Error("Token does not contain a valid tenant ID");
    if (env.allowedTenantIds.length && !env.allowedTenantIds.includes(tenantId)) {
      response.status(403).json({ error: "tenant_not_allowed", message: "This tenant is not allowed." });
      return;
    }

    const { payload } = await jwtVerify(token, getJwks(tenantId), {
      audience: env.ENTRA_API_CLIENT_ID,
      issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
      algorithms: ["RS256"],
    });

    request.user = {
      ...payload,
      accessToken: token,
      email: String(payload.preferred_username ?? payload.email ?? ""),
      name: String(payload.name ?? "Microsoft 365 user"),
      oid: String(payload.oid ?? payload.sub ?? ""),
      tenantId,
    };
    next();
  } catch {
    response.status(401).json({ error: "invalid_token", message: "The access token is invalid or expired." });
  }
}
