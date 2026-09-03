# First Test Configuration

Use this guide to query your Microsoft 365 data locally with your existing Entra account. This path does not require your own app registration, SPA registration, client secret, certificate, or OBO flow.

## Recommended: Local Work IQ CLI mode

### Prerequisites

- Node.js 20 or newer and npm.
- Your tenant administrator has consented to the Microsoft Work IQ application.
- Your user is assigned to a Copilot Credits billing policy.
- You are running the application on your trusted workstation. Local mode is single-user.

### 1. Configure `.env`

Create the file if needed:

```powershell
Copy-Item .env.example .env
```

Use this configuration, replacing the identity values with yours:

```dotenv
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:5173

WORK_IQ_MODE=local
TENANT_DISPLAY_NAME=Microsoft
DISPLAY_USER_NAME=Francisco Martinez
DISPLAY_USER_EMAIL=frmartin@microsoft.com
DISPLAY_TENANT_ID=microsoft
WORK_IQ_LOCAL_ACCOUNT=frmartin@microsoft.com

WORK_IQ_TIMEOUT_MS=90000
```

The `DISPLAY_*` values are labels shown in the local UI. Authentication and Microsoft 365 permissions come from `WORK_IQ_LOCAL_ACCOUNT` through the Work IQ CLI.

Do not create `frontend/.env` for local mode. Leaving it absent prevents the browser from trying to use a custom app registration.

### 2. Install dependencies

```powershell
npm install
```

### 3. Accept the Work IQ EULA

This is a one-time interactive legal acceptance that you must perform personally:

```powershell
npm run workiq:accept-eula
```

### 4. Sign in with your Entra account

```powershell
npm run workiq:login
```

Complete the Microsoft browser or Windows Account Manager prompt with the same address configured in `WORK_IQ_LOCAL_ACCOUNT`.

### 5. Verify Work IQ before starting the web app

```powershell
npm run workiq:config
npm run workiq:test
```

The test should return grounded information from your Microsoft 365 account. If this command fails, the web application will fail for the same tenant, consent, billing, or authentication reason.

### 6. Start the application

```powershell
npm run dev
```

Open `http://localhost:5173` and confirm:

- The header badge says **LOCAL**.
- Authentication status says **Interactive Entra sign-in through Work IQ CLI**.
- Work IQ access says **Local MCP via @microsoft/workiq**.
- A question such as `What meetings do I have today?` returns a result labeled **Grounded in your Microsoft 365 context**.

The API starts a local Work IQ MCP stdio process for each question. The CLI uses its encrypted cached identity and the response is returned to the local React application.

## Option B: Synthetic demo test

Demo mode does not require Azure credentials. It uses synthetic Microsoft 365 results, but the user and tenant shown in the interface can be customized.

### 1. Create the backend environment file

From the project root, run:

```powershell
Copy-Item .env.example .env
```

Open `.env` and set your display values:

```dotenv
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:5173

WORK_IQ_MODE=demo
TENANT_DISPLAY_NAME=Microsoft
DISPLAY_USER_NAME=Francisco Martinez
DISPLAY_USER_EMAIL=frmartin@microsoft.com
DISPLAY_TENANT_ID=microsoft.com

WORK_IQ_MCP_ENDPOINT=https://workiq.svc.cloud.microsoft/mcp
WORK_IQ_SCOPE=api://workiq.svc.cloud.microsoft/WorkIQAgent.Ask
WORK_IQ_TIMEOUT_MS=90000
```

For example:

```dotenv
TENANT_DISPLAY_NAME=Contoso
DISPLAY_USER_NAME=Adele Vance
DISPLAY_USER_EMAIL=adele.vance@contoso.com
DISPLAY_TENANT_ID=contoso-demo
```

The frontend `.env` file is not needed in demo mode.

### 2. Install and start

```powershell
npm install
npm run dev
```

Open `http://localhost:5173` and confirm:

- The header shows your configured name and email.
- The right panel shows your tenant name and tenant ID.
- The mode badge says **DEMO**.
- Asking `What should I focus on today?` returns a result labeled **Synthetic demo response**.

Restart `npm run dev` after changing `.env` values.

## Option C: Remote production mode

Remote mode queries Microsoft 365 as the signed-in Entra user. The displayed user name, email, and tenant ID come from the validated access token; `DISPLAY_*` values are ignored.

### Required information

Collect these values before configuring live mode:

| Value | Where to find it |
| --- | --- |
| Tenant ID | Entra admin center, **Identity > Overview > Tenant ID** |
| Tenant name | Your organization display name |
| SPA client ID | SPA app registration, **Application (client) ID** |
| API client ID | Express API app registration, **Application (client) ID** |
| API credential | Client secret for local testing, or certificate for production |

You need two Entra app registrations: one SPA registration for React and one confidential web API registration for Express.

### 1. Configure the Express API registration

On the API app registration:

1. Set the Application ID URI to `api://<API_CLIENT_ID>`.
2. Expose a delegated scope named `access_as_user`.
3. Add the delegated Work IQ permission `WorkIQAgent.Ask`.
4. Grant tenant admin consent.
5. Create a client secret for the first local test, or configure a certificate.

Work IQ delegated scope:

```text
api://workiq.svc.cloud.microsoft/WorkIQAgent.Ask
```

### 2. Configure the SPA registration

On the SPA app registration:

1. Add the SPA redirect URI `http://localhost:5173`.
2. Add the delegated API permission `api://<API_CLIENT_ID>/access_as_user`.
3. Grant consent according to your tenant policy.

### 3. Configure the backend

Create `.env` if it does not exist:

```powershell
Copy-Item .env.example .env
```

Set these values:

```dotenv
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:5173

WORK_IQ_MODE=remote
TENANT_DISPLAY_NAME=Your Company Name

ENTRA_API_CLIENT_ID=00000000-0000-0000-0000-000000000000
ALLOWED_TENANT_IDS=11111111-1111-1111-1111-111111111111
ENTRA_CLIENT_SECRET=your-local-development-secret

WORK_IQ_MCP_ENDPOINT=https://workiq.svc.cloud.microsoft/mcp
WORK_IQ_SCOPE=api://workiq.svc.cloud.microsoft/WorkIQAgent.Ask
WORK_IQ_TIMEOUT_MS=90000
```

Replace the example GUIDs and secret with your values. Do not commit `.env`; it is excluded by `.gitignore`.

### 4. Configure the frontend

Create `frontend/.env`:

```powershell
Copy-Item frontend/.env.example frontend/.env
```

Set these values:

```dotenv
VITE_ENTRA_CLIENT_ID=22222222-2222-2222-2222-222222222222
VITE_ENTRA_API_CLIENT_ID=00000000-0000-0000-0000-000000000000
VITE_ENTRA_TENANT_ID=11111111-1111-1111-1111-111111111111
VITE_REDIRECT_URI=http://localhost:5173
```

`VITE_ENTRA_API_CLIENT_ID` must match `ENTRA_API_CLIENT_ID`. Never put `ENTRA_CLIENT_SECRET` in the frontend file or in any `VITE_` variable.

### 5. Run the live test

```powershell
npm run dev
```

Open `http://localhost:5173`, select **Sign in**, and use an account from the configured tenant. Confirm:

- The mode badge says **LIVE**.
- The header identity matches the signed-in Microsoft 365 user.
- Authentication status says **Authenticated with Microsoft Entra ID**.
- Work IQ access says **Delegated access configured**.
- A question such as `What meetings do I have today?` returns a result labeled **Grounded in your Microsoft 365 context**.

## Troubleshooting

### The application still shows the old demo user

Stop and restart `npm run dev`. Backend environment variables are loaded when the API process starts.

### Sign in does not appear

Both `VITE_ENTRA_CLIENT_ID` and `VITE_ENTRA_API_CLIENT_ID` must be set in `frontend/.env`. Restart Vite after changing them.

### `This tenant is not allowed`

Set `ALLOWED_TENANT_IDS` to the signed-in user's home tenant ID. Multiple tenant IDs can be comma-separated.

### `The access token is invalid or expired`

Verify that the API token audience is the Express API client ID and that `VITE_ENTRA_API_CLIENT_ID` matches `ENTRA_API_CLIENT_ID`.

### Work IQ access or consent fails

Confirm that the Work IQ service principal exists in the tenant, `WorkIQAgent.Ask` has admin consent, and the user is included in the tenant's Work IQ and Copilot Credits policies.

### The local app asks for a custom browser sign-in

Remove or rename `frontend/.env` and restart `npm run dev`. Local mode authenticates in the Work IQ CLI, not in React.

### The CLI uses the wrong account

Run `npx -y @microsoft/workiq@1.0.0 auth logout`, then `npm run workiq:login`. Confirm that `.env` contains the selected account in `WORK_IQ_LOCAL_ACCOUNT`.