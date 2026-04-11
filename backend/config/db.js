import mongoose from "mongoose";

/**
 * Connect to MongoDB (used by server and seed script).
 */
export async function connectDatabase(uri) {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
}
