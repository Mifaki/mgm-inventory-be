import type { NextFunction, Request, Response } from "express";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();

  if (process.env.NODE_ENV === "production" && req.path.includes("/health")) {
    return next();
  }

  res.on("finish", () => {
    const duration = Date.now() - start;
    const { method, url, ip } = req;
    const { statusCode } = res;

    const logData = {
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      ip,
      userAgent: req.get("User-Agent"),
      timestamp: new Date().toISOString(),
    };

    if (process.env.NODE_ENV === "development") {
      const statusColor = statusCode >= 400 ? "\x1b[31m" : "\x1b[32m";
      const reset = "\x1b[0m";

      console.log(
        `${statusColor}${method} ${url} ${statusCode}${reset} - ${duration}ms`
      );
    } else {
      console.log(JSON.stringify(logData));
    }
  });

  next();
};
