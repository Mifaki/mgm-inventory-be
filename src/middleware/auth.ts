import { NextFunction, Request, Response } from "express";

import { sendError } from "../utils/response";
import { verifyAccessToken } from "../utils/jwt";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    sendError(res, "Access token required", 401);
    return;
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    sendError(res, "Access token required", 401);
    return;
  }
  try {
    const payload = verifyAccessToken(token) as { userId: number };
    (req as any).userId = payload.userId;
    next();
  } catch (err: any) {
    sendError(res, "Invalid or expired access token", 401);
  }
}
