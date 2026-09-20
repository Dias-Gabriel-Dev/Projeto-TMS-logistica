export interface UserPayload {
  id: string;
  email: string;
  role: string;
}

export interface RateLimit {
  windowMs: number;
  limit: number;
  standardHeaders: boolean;
  legacyHeaders: boolean;
}

declare global {
  namespace Express {
    export interface Request {
      user?: UserPayload;
      rateLimit?: RateLimit;
    }
  }
}
