export type WorkIqMode = "demo" | "local" | "remote";

export type UserContext = {
  mode: WorkIqMode;
  user: {
    name: string;
    email: string;
    tenantId: string;
    tenantName: string;
  };
  status: {
    authentication: string;
    license: string;
    workIqAccess: string;
    billingMethod: string;
    copilotCredits: string;
    userContext: string;
  };
};

export type AskRequest = {
  question: string;
  conversationId?: string;
  timeZone?: string;
};

export type AskResponse = {
  answer: string;
  conversationId?: string;
  durationMs: number;
  grounded: boolean;
  mode: WorkIqMode;
};

export type ApiError = {
  error: string;
  message: string;
};
