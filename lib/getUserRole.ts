import { auth } from "@/auth";
import { connectDB } from "@/lib/dbConnect";
import User from "@/models/user";

export async function GetUserRole(): Promise<"employer" | "seeker" | null> {
  try {
    // 1️⃣ Ensure DB connection
    await connectDB();

    // 2️⃣ Get current session
    const session = await auth();
    if (!session?.user?.email) {
      return null; // No session or invalid user
    }

    // 3️⃣ Find user in DB
    const user = await User.findOne({ email: session.user.email }).lean();
    if (!user) {
      return null;
    }

    // 4️⃣ Return user role
    return user.role || null;
  } catch (error) {
    console.error("❌ Error fetching user role:", error);
    return null;
  }
}
