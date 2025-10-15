import { auth } from "@/auth";
import { connectDB } from "@/lib/dbConnect";
import Job from "@/models/Job";
import { NextResponse } from "next/server";



export async function GET() {
  try {
    await connectDB();
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobs = await Job.find({})
    // .sort({ createdAt: -1 });

    return NextResponse.json({ success:true, jobs}, { status: 200 });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

