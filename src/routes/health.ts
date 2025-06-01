import { sendError, sendSuccess } from "@/utils/response";

import { Router } from "express";
import { asyncHandler } from "@/middleware/error";
import { db } from "@/db/connection";
import { sql } from "drizzle-orm";

const router = Router();

router.get("/", (req, res) => {
  sendSuccess(
    res,
    {
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
    },
    "Service is healthy"
  );
});

router.get(
  "/db",
  asyncHandler(async (req, res) => {
    try {
      await db.run(sql`SELECT 1`);

      sendSuccess(
        res,
        {
          database: "Connected",
          timestamp: new Date().toISOString(),
        },
        "Database connection is healthy"
      );
    } catch (error) {
      console.error("Database health check failed:", error);
      sendError(res, "Database connection failed", 503, {
        database: "Disconnected",
        timestamp: new Date().toISOString(),
      });
    }
  })
);

router.get(
  "/detailed",
  asyncHandler(async (req, res) => {
    const healthCheck = {
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
      memory: {
        used:
          Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) /
          100,
        total:
          Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) /
          100,
      },
      database: "Unknown",
    };

    try {
      await db.run(sql`SELECT 1`);
      healthCheck.database = "Connected";
    } catch (error) {
      healthCheck.database = "Disconnected";
      healthCheck.status = "Degraded";
    }

    const statusCode = healthCheck.status === "OK" ? 200 : 503;
    sendSuccess(res, healthCheck, "Health check completed", statusCode);
  })
);

export default router;
