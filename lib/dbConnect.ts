
import mongoose, { Connection } from "mongoose";

let connection: Connection | null = null;

export async function connectDB(): Promise<Connection> {
  // ✅ Use cached connection if available
  if (connection) {
    console.log("✅ Using cached database connection");
    return connection;
  }

  // ✅ Ensure the MONGODB_URI environment variable exists
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("❌ Please define the MONGODB_URI environment variable in .env.local");
  }

  try {
    // ✅ Connect to MongoDB
    const db = await mongoose.connect(uri);
    connection = db.connection;

    console.log("🚀 New database connection established");
    return connection;
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    throw new Error("Database connection failed");
  }
}
