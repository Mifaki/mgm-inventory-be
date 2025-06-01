import { errorHandler, notFoundHandler } from "./middleware/error";

import compression from "compression";
import cors from "cors";
import express from "express";
import healthRoutes from "./routes/health";
import helmet from "helmet";
import itemRoutes from "./routes/item";
import { rateLimiter } from "./middleware/rateLimit";
import { requestLogger } from "./middleware/logger";

const app = express();

// This is necessary for trust proxy for Vercel
app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://mgm.ub.ac.id/"]
        : [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:8000",
          ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(requestLogger);
app.use(rateLimiter);

const apiVersion = process.env.API_VERSION || "v1";
app.use(`/api/${apiVersion}/health`, healthRoutes);
app.use(`/api/${apiVersion}/item`, itemRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "MGM Inventory API",
    version: apiVersion,
    timestamp: new Date().toISOString(),
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
