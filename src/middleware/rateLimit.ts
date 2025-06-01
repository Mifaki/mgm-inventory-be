import type { NextFunction, Request, Response } from "express";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 100;

setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key]?.resetTime && store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 10 * 60 * 1000);

export const rateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (process.env.NODE_ENV === "development" || req.path.includes("/health")) {
    return next();
  }

  const key = req.ip || "unknown";
  const now = Date.now();

  if (!store[key] || store[key]!.resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + WINDOW_MS,
    };

    res.set({
      "X-RateLimit-Limit": MAX_REQUESTS.toString(),
      "X-RateLimit-Remaining": (MAX_REQUESTS - 1).toString(),
      "X-RateLimit-Reset": new Date(store[key]!.resetTime).toISOString(),
    });

    return next();
  }

  store[key]!.count++;

  res.set({
    "X-RateLimit-Limit": MAX_REQUESTS.toString(),
    "X-RateLimit-Remaining": Math.max(
      0,
      MAX_REQUESTS - store[key]!.count
    ).toString(),
    "X-RateLimit-Reset": new Date(store[key]!.resetTime).toISOString(),
  });

  if (store[key]!.count > MAX_REQUESTS) {
    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later",
      retryAfter: Math.ceil((store[key]!.resetTime - now) / 1000),
    });
    return;
  }

  next();
};
