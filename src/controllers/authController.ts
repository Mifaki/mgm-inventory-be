import * as authService from "../services/authService";

import { Request, Response } from "express";
import {
  loginSchema,
  refreshTokenSchema,
  registerSchema,
} from "../models/schema/user";
import { sendError, sendSuccess } from "../utils/response";

export class AuthController {
  static async register(req: Request, res: Response) {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      sendError(res, "Validation error", 400, validation.error.errors);
      return;
    }
    try {
      const result = await authService.register(validation.data);
      sendSuccess(res, result, "User registered successfully", 201);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  static async login(req: Request, res: Response) {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      sendError(res, "Validation error", 400, validation.error.errors);
      return;
    }
    try {
      const result = await authService.login(validation.data);
      sendSuccess(res, result, "Login successful");
    } catch (err: any) {
      sendError(res, err.message, 401);
    }
  }

  static async refreshToken(req: Request, res: Response) {
    const validation = refreshTokenSchema.safeParse(req.body);
    if (!validation.success) {
      sendError(res, "Validation error", 400, validation.error.errors);
      return;
    }
    try {
      const result = await authService.refreshToken(
        validation.data.refreshToken
      );
      sendSuccess(res, result, "Token refreshed");
    } catch (err: any) {
      sendError(res, err.message, 401);
    }
  }
}
