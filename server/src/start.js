import { execSync } from "child_process";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

console.log("🔄 Running database migrations...");
try {
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
  console.log("✅ Migrations completed successfully");
} catch (error) {
  console.error("❌ Migration failed:", error.message);
  process.exit(1);
}

// Import and start the server
console.log("🚀 Starting server...");
import("./server.js");
