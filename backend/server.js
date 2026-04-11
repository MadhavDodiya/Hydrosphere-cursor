import "./config/env.js";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { connectDatabase } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import savedRoutes from "./routes/savedRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 5000;

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
app.use(express.json({ limit: "1mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/saved", savedRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, name: "HydroSphere API" });
});

app.use("/api", (_req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use(errorHandler);

async function start() {
  if (!process.env.MONGODB_URI) {
    console.error("Missing MONGODB_URI in environment");
    process.exit(1);
  }
  if (!process.env.JWT_SECRET) {
    console.error("Missing JWT_SECRET in environment");
    process.exit(1);
  }

  await connectDatabase(process.env.MONGODB_URI);
  console.log("MongoDB connected");

  const server = app.listen(PORT, () => {
    console.log(`HydroSphere API listening on http://localhost:${PORT}`);
  });

  const shutdown = async () => {
    console.log("\nClosing server…");
    server.close(() => {
      mongoose.connection.close().finally(() => process.exit(0));
    });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `\nPort ${PORT} is already in use (another app or an old HydroSphere server).\n` +
          `Fix: stop the other process, or set PORT=5001 in backend/.env (the Vite dev server reads PORT from there for /api proxy).\n`
      );
    } else {
      console.error(err);
    }
    process.exit(1);
  });
}

start().catch((err) => {
  console.error(err.message || err);
  if (String(err.message || "").includes("ECONNREFUSED")) {
    console.error(
      "\nMongoDB refused the connection. Start MongoDB locally or fix MONGODB_URI in backend/.env (e.g. Atlas connection string).\n"
    );
  }
  process.exit(1);
});
