import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import Application from "@/models/Application";
import { auth } from "@/auth";

export async function PUT(req: Request) {
  try {
    await connectDB();
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ Only employers can update application status
    if (session.user.role !== "employer") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Only employers can perform this action" },
        { status: 403 }
      );
    }

    const { jobId, seekerId, status } = await req.json();

    // ✅ Basic validation
    if (!jobId || !seekerId || !status) {
      return NextResponse.json(
        { success: false, message: "Missing jobId, seekerId, or status" },
        { status: 400 }
      );
    }

    if (!["pending", "accepted", "rejected"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status value" },
        { status: 400 }
      );
    }

    // ✅ Find the application
    const application = await Application.findOne({ jobId, seekerId });
    if (!application) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      );
    }

    // ✅ Update status
    application.status = status as "pending" | "accepted" | "rejected";
    await application.save();

    return NextResponse.json({
      success: true,
      message: "Application status updated successfully",
      application,
    });
  } catch (error) {
    console.error("❌ Error updating status:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
