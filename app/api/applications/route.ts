import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import Application from "@/models/Application";
import { auth } from "@/auth";
import cloudinary from "@/lib/cloudinary";

// ✅ Define a type for the Cloudinary upload result
interface CloudinaryUploadResult {
  secure_url: string;
  resource_type: string;
  public_id: string;
  format?: string;
  
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    await connectDB();
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const jobId = formData.get("jobId") as string | null;
    const coverLetter = formData.get("coverLetter") as string | null;
    const location = formData.get("location") as string | null;
    const file = formData.get("resume") as File | null;

    // ✅ Basic validation
    if (!jobId || !file) {
      return NextResponse.json(
        { success: false, message: "Missing jobId or file" },
        { status: 400 }
      );
    }

    // ✅ Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, message: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // ✅ Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ✅ Upload to Cloudinary with proper typing and verification
  const uploadResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    {
      folder: "job_portal_resumes",
      resource_type: "raw",
      type: "upload",
      access_mode: "public",
      public_id: `resume_${Date.now()}`,
      format: "pdf",
    },
    (error, result) => {
      if (error) reject(error);
      else resolve(result as CloudinaryUploadResult);
    }
  );
  stream.end(buffer);
});

    // ✅ Verify Cloudinary stored as 'raw'
    if (uploadResult.resource_type !== "raw") {
      console.warn(
        `⚠️ Cloudinary stored file as '${uploadResult.resource_type}' instead of 'raw'`
      );
    }

  

    // ✅ Save application in MongoDB
    const newApplication = await Application.create({
      jobId,
      seekerId: session.user.id,
      seekerEmail: session.user.email,
      coverLetter,
      location,
      resumeURL: uploadResult.secure_url,
    });

    console.log("✅ Uploaded and verified resume:", uploadResult.secure_url);

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully",
      application: newApplication,
    });
  } catch (error: unknown) {
    console.error("❌ Application error:", error);
    const errMsg =
      error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json(
      { success: false, message: errMsg },
      { status: 500 }
    );
  }
}






export async function GET() {
    try {
  await connectDB()
        const session = await auth();
        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

    const applications = await Application.find({ seekerId: session.user.id})
      .populate("jobId", "title location salaryRange jobType")
      .sort({ createdAt: -1 });

   const count = applications.length

    const recent = await Application.find({ seekerId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("jobId", "title company location salaryRange jobType")
      .exec();

 return NextResponse.json({ success: true, count, recent, data: applications });
  } catch (error) {
    console.error("Fetch applications error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
