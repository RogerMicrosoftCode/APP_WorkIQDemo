import { ConfidentialClientApplication, type Configuration } from "@azure/msal-node";
import { env } from "../config/env.js";

const clients = new Map<string, ConfidentialClientApplication>();

function getClient(tenantId: string) {
  const cached = clients.get(tenantId);
  if (cached) return cached;

  const clientCredential: Configuration["auth"] = {
    authority: `https://login.microsoftonline.com/${tenantId}`,
    clientId: env.ENTRA_API_CLIENT_ID!,
    ...(env.ENTRA_CERT_THUMBPRINT && env.ENTRA_CERT_PRIVATE_KEY
      ? {
          clientCertificate: {
            thumbprint: env.ENTRA_CERT_THUMBPRINT,
            privateKey: env.ENTRA_CERT_PRIVATE_KEY.replace(/\\n/g, "\n"),
          },
        }
      : { clientSecret: env.ENTRA_CLIENT_SECRET! }),
  };

  const client = new ConfidentialClientApplication({
    auth: clientCredential,
    system: { loggerOptions: { piiLoggingEnabled: false } },
  });
  clients.set(tenantId, client);
  return client;
}

export async function acquireWorkIqToken(userAssertion: string, tenantId: string) {
  const result = await getClient(tenantId).acquireTokenOnBehalfOf({
    oboAssertion: userAssertion,
    scopes: [env.WORK_IQ_SCOPE],
  });

  if (!result?.accessToken) throw new Error("Microsoft Entra ID did not return a Work IQ access token");
  return result.accessToken;
}
