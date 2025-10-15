import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/dbConnect";
import Job from "@/models/Job";
import Application from "@/models/Application";

export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, skills, location, salaryRange, jobType } = body;

    if (!title || !description || !skills || !location || !salaryRange || !jobType) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const newJob = await Job.create({
      title,
      description,
      skills: skills.split(",").map((s: string) => s.trim()),
      location,
      salaryRange,
      jobType,
      employerId: session.user.id,
    });

    return NextResponse.json({ success: true, job: newJob }, { status: 201 });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


export async function GET() {
  try {
    await connectDB();
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobs = await Job.find({ employerId: session.user.id })
    .sort({ createdAt: -1 });
     // ✅ Count total jobs
    const totalJobs = jobs.length;

    //  ✅ Count total applicants (applications for employer's jobs)
    const jobIds = jobs.map((job) => job._id);
    const totalApplicants = await Application.countDocuments({ jobId: { $in: jobIds } });
    // ✅ Count active jobs (assuming you have `isActive` field in Job model)
    const activeJobs = await Job.countDocuments({ employerId:session.user.id, isActive: true });

    // ✅ Build chart data: each job → number of applicants
    const jobStats = await Promise.all(
      jobs.map(async (job) => {
        const count = await Application.countDocuments({ jobId: job._id });
        return {
          name: job.title,
          applicants: count,
        };
      })
    );


   return NextResponse.json({
      success: true,
      jobs,
      stats: {
        totalJobs,
        totalApplicants,
        activeJobs,
        jobStats,
      },
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

