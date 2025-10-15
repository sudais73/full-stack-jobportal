// 📂 app/api/applications/user/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/dbConnect";
import Application from "@/models/Application";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const apps = await Application.find({ seekerId: session.user.id }).select("jobId");
    const appliedJobIds = apps.map((a) => a.jobId.toString());

    return NextResponse.json({ success: true, appliedJobIds });
  } catch (error) {
    console.error("Error fetching user applications:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
