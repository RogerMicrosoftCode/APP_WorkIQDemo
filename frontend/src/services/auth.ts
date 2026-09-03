import {
  PublicClientApplication,
  type AccountInfo,
  type Configuration,
} from "@azure/msal-browser";

const clientId = import.meta.env.VITE_ENTRA_CLIENT_ID;
const apiClientId = import.meta.env.VITE_ENTRA_API_CLIENT_ID;
const tenantId = import.meta.env.VITE_ENTRA_TENANT_ID ?? "organizations";

export const authEnabled = Boolean(clientId && apiClientId);

const config: Configuration = {
  auth: {
    clientId: clientId ?? "00000000-0000-0000-0000-000000000000",
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: import.meta.env.VITE_REDIRECT_URI ?? window.location.origin,
  },
  cache: { cacheLocation: "sessionStorage" },
};

export const msalInstance = new PublicClientApplication(config);
export const apiScopes = apiClientId ? [`api://${apiClientId}/access_as_user`] : [];

export async function getApiAccessToken(account?: AccountInfo) {
  if (!authEnabled) return undefined;

  const selectedAccount = account ?? msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0];
  if (!selectedAccount) return undefined;

  try {
    const result = await msalInstance.acquireTokenSilent({ account: selectedAccount, scopes: apiScopes });
    return result.accessToken;
  } catch {
    const result = await msalInstance.acquireTokenPopup({ account: selectedAccount, scopes: apiScopes });
    return result.accessToken;
  }
}
