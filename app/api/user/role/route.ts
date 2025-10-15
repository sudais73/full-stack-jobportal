import { auth } from "@/auth";
import { connectDB } from "@/lib/dbConnect";
import User from "@/models/user";
import { NextResponse } from "next/server";



export async function PUT(req: Request) {
  await connectDB();
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { role } = await req.json();

  if (!["seeker", "employer"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  await User.findOneAndUpdate(
    { email: session.user.email },
    { role },
    { new: true }
  );

  return NextResponse.json({ message: "Role updated successfully" });
}
