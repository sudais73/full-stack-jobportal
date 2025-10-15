import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import Application from "@/models/Application";
import { auth } from "@/auth";

export async function GET(
  req: Request,
  { params }: { params: { jobId: string } }
) {
  try {
    await connectDB();
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { jobId } = params;

    // ✅ Fetch applicants for this specific job
    const applicants = await Application.find({ jobId })
      .populate("seekerId", "name email department skills") // Pulls seeker info
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, applicants });
  } catch (error) {
    console.error("Error fetching applicants:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
