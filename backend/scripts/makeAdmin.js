import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load env from the backend directory
dotenv.config({ path: path.join(__dirname, "../.env") });

async function promote() {
  const email = process.argv[2] || "[EMAIL_ADDRESS]";
  
  if (!process.env.MONGODB_URI) {
    console.error("❌ Error: MONGODB_URI not found in backend/.env");
    process.exit(1);
  }

  try {
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(process.env.MONGODB_URI);
    
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { role: "admin" },
      { new: true }
    );

    if (user) {
      console.log(`\n✅ SUCCESS: ${user.name} (${user.email}) has been promoted to Super Admin.`);
      console.log(`You can now log in at http://localhost:5173/login and access the Admin Panel.`);
    } else {
      console.log(`\n❌ ERROR: User with email "${email}" not found.`);
      console.log(`Try: node scripts/makeAdmin.js <different_email>`);
    }
  } catch (err) {
    console.error("❌ Mongodb Connection Error:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

promote();
