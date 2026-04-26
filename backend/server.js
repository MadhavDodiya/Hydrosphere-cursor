import "./config/env.js";
import express from "express";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import mongoose from "mongoose";
import { Server as SocketIOServer } from "socket.io";
import { connectDatabase } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import savedRoutes from "./routes/savedRoutes.js";
import inquiryRoutes from "./routes/inquiryRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import billingRoutes from "./routes/billingRoutes.js";

import { errorHandler } from "./middleware/errorHandler.js";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import { setIO } from "./utils/realtime.js";
import morgan from "morgan";
import logger from "./utils/logger.js";
import { initCronJobs } from "./services/cronService.js";

const app = express();
const PORT = process.env.PORT || 5000;

// HTTP Request Logging
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev", {
  stream: { write: (message) => logger.info(message.trim()) }
}));

// Security: Set security HTTP headers
app.use(helmet());

// ── Rate Limiting ──────────────────────────────────────────────────────────
// Strict limiter for authentication (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // Limit each IP to 20 requests per window
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many authentication attempts. Please try again after 15 minutes." },
});

// Relaxed limiter for general API & Dashboard (prevent abuse but allow high activity)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500, // Increased from 100 to 500 to accommodate dashboard polling and heavy usage
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many requests from this IP. Please try again after 15 minutes." },
});

// Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  message: { message: "Too many requests. Please try again later." },
});
app.use(globalLimiter);

// Apply strict limiters for sensitive routes
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api", apiLimiter);

/**
 * CORS: production uses FRONTEND_URL (comma-separated). Dev allows localhost,
 * 127.0.0.1, and LAN IPs (Vite --host) so phones/other PCs can hit the API.
 */
function isPrivateLanHost(hostname) {
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
  return /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(hostname);
}

const corsOptions =
  process.env.NODE_ENV === "production" && process.env.FRONTEND_URL
    ? {
        origin: process.env.FRONTEND_URL.split(",").map((s) => s.trim()).filter(Boolean),
        credentials: true,
      }
    : {
        origin(origin, callback) {
          if (!origin) return callback(null, true);
          try {
            const u = new URL(origin);
            if (u.protocol !== "http:" && u.protocol !== "https:") {
              return callback(null, false);
            }
            const h = u.hostname;
            if (h === "localhost" || h === "127.0.0.1") return callback(null, true);
            if (isPrivateLanHost(h)) return callback(null, true);
            return callback(null, false);
          } catch {
            return callback(null, false);
          }
        },
        credentials: true,
      };

app.use(cors(corsOptions));
app.use(cookieParser());

// Stripe Webhook: Needs raw body for signature verification
import { handleWebhook } from "./controllers/billingController.js";
app.post("/api/billing/webhook", express.raw({ type: "application/json" }), handleWebhook);

app.use(express.json({ limit: "1mb" }));
// Prevent NoSQL injection ($ operators) from request inputs
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/saved", savedRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/supplier", supplierRoutes);
app.use("/api/billing", billingRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, name: "HydroSphere API" });
});

app.use("/api", (_req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use(errorHandler);

async function start() {
  if (!process.env.MONGODB_URI) {
    throw new Error("Missing MONGODB_URI in environment");
  }
  if (!process.env.JWT_SECRET) {
    throw new Error("Missing JWT_SECRET in environment");
  }
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("Missing JWT_REFRESH_SECRET in environment");
  }

  await connectDatabase(process.env.MONGODB_URI);
  logger.info("MongoDB connected");

  // Initialize Background Workers (Task #11 Audit Fix)
  initCronJobs();

  const server = createServer(app);

  const io = new SocketIOServer(server, {
    cors: {
      origin: corsOptions.origin,
      credentials: true,
    },
  });

  // Socket authentication: Bearer token via `auth.token`
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.headers?.authorization?.startsWith("Bearer ")
          ? socket.handshake.headers.authorization.slice(7)
          : null);

      if (!token) return next(new Error("Unauthorized"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("role isSuspended");
      if (!user) return next(new Error("Unauthorized"));
      if (user.isSuspended) return next(new Error("Forbidden"));

      socket.userId = decoded.userId;
      socket.role = user.role;
      return next();
    } catch (err) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    // Per-user room for notifications
    socket.join(`user:${socket.userId}`);

    socket.on("inquiry:join", (inquiryId) => {
      if (inquiryId) socket.join(`inquiry:${String(inquiryId)}`);
    });

    socket.on("inquiry:leave", (inquiryId) => {
      if (inquiryId) socket.leave(`inquiry:${String(inquiryId)}`);
    });
  });

  setIO(io);

  server.listen(PORT, () => {
    console.log(`HydroSphere API listening on http://localhost:${PORT}`);
  });

  const shutdown = async () => {
    logger.info("Closing server…");
    server.close(() => {
      mongoose.connection.close().finally(() => process.exit(0));
    });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  });

  process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception:", error);
    // Optional: Graceful shutdown
    // shutdown();
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      logger.error(
        `Port ${PORT} is already in use (another app or an old HydroSphere server). ` +
          `Fix: stop the other process, or set PORT=5001 in backend/.env.`
      );
    } else {
      logger.error(err);
    }
    process.exit(1);
  });
}

start().catch((err) => {
  logger.error(err.message || err);
  if (String(err.message || "").includes("ECONNREFUSED")) {
    logger.error(
      "MongoDB refused the connection. Start MongoDB locally or fix MONGODB_URI in backend/.env."
    );
  }
  process.exit(1);
});
