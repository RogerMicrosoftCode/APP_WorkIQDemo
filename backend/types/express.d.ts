import type { JWTPayload } from "jose";

export type AuthenticatedUser = JWTPayload & {
  accessToken: string;
  email: string;
  name: string;
  oid: string;
  tenantId: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
