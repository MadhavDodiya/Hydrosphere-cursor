import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Load backend/.env relative to this package (works even if cwd is not `backend/`).
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "..", ".env");

const result = dotenv.config({ path: envPath });
if (result.error && process.env.NODE_ENV !== "test") {
  console.warn(
    `[env] Could not load ${envPath} — using process.env only. (${result.error.message})`
  );
}
