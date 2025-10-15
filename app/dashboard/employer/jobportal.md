 Below is the **single Markdown file** you asked for. It compiles the code you created and the explanations we discussed — from project setup and models, through authentication, seeker features, file upload/Cloudinary, recommendation logic, and employer features (dashboard, job list, applicants). Copy the whole content into a file named `JobPortal_Full_Documentation.md` and open in VS Code.

> Note: This file focuses on the final working code patterns we discussed and concise line-by-line explanations for the most important files. It omits repeated iterations and tiny debug prints for readability.

---

# Job Portal — Full Documentation

---

## Table of Contents

1. Project overview
2. Environment & Setup
3. Folder structure
4. Database connection (`dbConnect`)
5. Models

   * User
   * Job
   * Application
6. Authentication (NextAuth)
7. Cloudinary setup (resume upload)
8. API Routes

   * Applications (apply, user apps, count, recent)
   * Jobs (list, recommended)
   * Seeker profile (GET, PUT)
   * Employer: jobs, dashboard stats, applicants
9. Frontend - Seeker

   * Layout notes
   * Dashboard (dynamic)
   * Browse Jobs + Apply Modal
   * My Applications
   * Profile page
10. Frontend - Employer

    * Layout & Sidebar
    * Dashboard (dynamic)
    * Job List
    * Applicants page (per job)
11. Tips, common issues and improvements
12. Appendix — helper snippets

---

## 1. Project overview

A full-stack AI-ish job portal built with Next.js (app router), TypeScript (where shown), MongoDB (Mongoose), NextAuth for authentication, and Cloudinary for storing resumes. The platform supports two roles: **seeker** and **employer**. Seeker can browse & apply to jobs, upload resume. Employer can post jobs, see applicants, and view analytics.

---

## 2. Environment & Setup

Add to `.env.local` (server-side only — do not expose secrets in `NEXT_PUBLIC_` except the cloud name if needed):

```
MONGODB_URI=mongodb+srv://...
AUTH_SECRET=your_nextauth_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Install dependencies (example):

```
npm install next react react-dom next-auth mongoose axios react-hot-toast recharts cloudinary
```

---

## 3. Folder structure (recommended)

```
app/
  api/
    applications/
    jobs/
    seeker/
    employer/
  dashboard/
    seeker/
    employer/
  tasks/
components/
lib/
  dbConnect.ts
  cloudinary.ts
  auth.ts
models/
  User.ts
  Job.ts
  Application.ts
```

---

## 4. Database connection (`lib/dbConnect.ts`)

Use a stable connection helper (TypeScript):

```ts
// lib/dbConnect.ts
import mongoose from 'mongoose';

let cached: { conn?: typeof mongoose | null } = {};

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!process.env.MONGODB_URI) {
    throw new Error('Please define MONGODB_URI');
  }
  const conn = await mongoose.connect(process.env.MONGODB_URI);
  cached.conn = conn;
  return conn;
}
```

**Explanation:** Caches connection in module scope to avoid reconnects during hot reload/dev.

---

## 5. Models

### 5.1 User

```ts
// models/User.ts
import mongoose, { Schema, models } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    image: { type: String },
    role: { type: String, enum: ["seeker", "employer"], default: "seeker" },
    department: { type: String, default: "" },
    skills: { type: [String], default: [] },
    resumeURL: { type: String },
  },
  { timestamps: true }
);

const User = models.User || mongoose.model("User", userSchema);
export default User;
```

**Notes:**

* `department` added with default `""` so new documents include the field.
* `skills` stored as string array.

---

### 5.2 Job

```ts
// models/Job.ts
import mongoose, { Schema, models } from "mongoose";

const JobSchema = new Schema(
  {
    employerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    skills: { type: [String], default: [] },
    salaryRange: { type: String },
    jobType: {
      type: String,
      enum: ["onsite", "remote", "contract"],
      required: true,
    },
    company: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Job = models.Job || mongoose.model("Job", JobSchema);
export default Job;
```

**Notes:**

* `isActive` allows active job counting.

---

### 5.3 Application

```ts
// models/Application.ts
import mongoose, { Schema, models } from "mongoose";

const ApplicationSchema = new Schema(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    seekerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    seekerEmail: { type: String, required: true },
    coverLetter: { type: String },
    location: { type: String },
    resumeURL: { type: String },
    status: {
      type: String,
      enum: ["pending", "reviewed", "accepted", "rejected"],
      default: "pending"
    },
  },
  { timestamps: true }
);

const Application = models.Application || mongoose.model("Application", ApplicationSchema);
export default Application;
```

---

## 6. Authentication (NextAuth)

Example NextAuth config with sign-in callback that upserts user and a session callback to add `id` and `role` to session.

```ts
// lib/auth.ts (or app/api/auth/..., depending on codebase)
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import User from "@/models/User";
import { connectDB } from "@/lib/dbConnect";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GoogleProvider, GitHub()],
  callbacks: {
    async signIn({ user }) {
      await connectDB();
      await User.findOneAndUpdate(
        { email: user.email },
        { name: user.name, image: user.image },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return true;
    },
    async session({ session }) {
      await connectDB();
      const dbUser = await User.findOne({ email: session.user?.email });
      if (dbUser) {
        session.user.id = dbUser._id.toString();
        session.user.role = dbUser.role || null;
      }
      return session;
    }
  },
  secret: process.env.AUTH_SECRET,
});
```

**Explanation (key lines):**

* `signIn` callback upserts user to DB on first login.
* `session` callback attaches DB `id` and `role` to the session for server APIs.

---

## 7. Cloudinary setup (`lib/cloudinary.ts`)

```ts
// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export default cloudinary;
```

**Important:** Use only server-side env variables for API key & secret. Use `resource_type: 'auto'` or `'raw'` when uploading PDFs (docs below).

---

## 8. API Routes

> Each API route uses `connectDB()` and `auth()` to ensure authenticated access where needed.

### 8.1 Applications API — apply with Cloudinary upload (POST)

`app/api/applications/route.ts`

```ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import Application from "@/models/Application";
import cloudinary from "@/lib/cloudinary";
import { auth } from "@/auth"; // server-side auth helper

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const jobId = formData.get("jobId") as string;
    const coverLetter = formData.get("coverLetter") as string;
    const location = formData.get("location") as string;
    const file = formData.get("resume") as File | null;

    if (!jobId || !file) return NextResponse.json({ success: false, message: "Missing jobId or file" }, { status: 400 });

    await connectDB();

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const publicId = `${file.name.split('.')[0]}_${Date.now()}`;
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "job_portal_resumes",
          resource_type: "auto",   // recommended for PDFs
          public_id: publicId,
          format: "pdf",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(buffer);
    });

    const newApp = await Application.create({
      jobId,
      seekerId: session.user.id,
      seekerEmail: session.user.email,
      coverLetter,
      location,
      resumeURL: uploadResult.secure_url,
    });

    return NextResponse.json({ success: true, application: newApp });
  } catch (error) {
    console.error("Application error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
```

**Line by line highlights:**

* `formData()` used to accept file upload from client.
* Convert file to Buffer and upload via `upload_stream` to Cloudinary.
* Save only `resumeURL` into DB.

---

### 8.2 Get user’s applied job IDs

`app/api/applications/user/route.ts`

```ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import Application from "@/models/Application";
import { auth } from "@/auth";

export async function GET() {
  await connectDB();
  const session = await auth();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const apps = await Application.find({ seekerId: session.user.id }).select("jobId");
  const appliedJobIds = apps.map(a => a.jobId.toString());
  return NextResponse.json({ success: true, appliedJobIds });
}
```

**Use:** Frontend can call this to disable/hide Apply buttons for jobs already applied to.

---

### 8.3 Get applications count for seeker

`app/api/applications/count/route.ts`

```ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import Application from "@/models/Application";
import { auth } from "@/auth";

export async function GET() {
  await connectDB();
  const session = await auth();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const count = await Application.countDocuments({ seekerId: session.user.id });
  return NextResponse.json({ success: true, count });
}
```

---

### 8.4 Fetch recent applications for seeker

`app/api/applications/recent/route.ts`

```ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import Application from "@/models/Application";
import { auth } from "@/auth";

export async function GET() {
  await connectDB();
  const session = await auth();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const recent = await Application.find({ seekerId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("jobId", "title location salaryRange jobType")
    .lean();

  return NextResponse.json({ success: true, applications: recent });
}
```

---

### 8.5 Seeker profile GET & PUT

`app/api/seeker/profile/route.ts`

```ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import User from "@/models/User";
import { auth } from "@/auth";

export async function GET() {
  await connectDB();
  const session = await auth();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const user = await User.findOne({ email: session.user.email }).lean();
  return NextResponse.json({ success: true, user });
}

export async function PUT(req: Request) {
  await connectDB();
  const session = await auth();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { department, skills } = await req.json();
  const updated = await User.findOneAndUpdate({ email: session.user.email }, { department, skills }, { new: true });
  return NextResponse.json({ success: true, user: updated });
}
```

---

### 8.6 Jobs recommended (exclude already-applied)

`app/api/jobs/recommended/route.ts`

```ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/dbConnect';
import Job from '@/models/Job';
import User from '@/models/User';
import Application from '@/models/Application';
import { auth } from '@/auth';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectDB();
    const session = await auth();
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const user = await User.findOne({ email: session.user.email }).lean();
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    const userSkills = user.skills || [];
    const userDepartment = user.department?.toLowerCase();

    const appliedApps = await Application.find({ seekerId: user._id }, 'jobId');
    const appliedJobIds = appliedApps.map((a) => new mongoose.Types.ObjectId(a.jobId));

    const query: any = { _id: { $nin: appliedJobIds } };
    if (userSkills.length > 0 || userDepartment) {
      query.$or = [];
      if (userSkills.length > 0) query.$or.push({ skills: { $in: userSkills } });
      if (userDepartment) {
        query.$or.push({
          $or: [
            { title: { $regex: userDepartment, $options: 'i' } },
            { description: { $regex: userDepartment, $options: 'i' } },
          ],
        });
      }
    }

    const jobs = await Job.find(query).limit(10).lean();
    return NextResponse.json({ success: true, jobs });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
```

**Explanation:** Excludes applied jobs and matches by skills or department keywords.

---

### 8.7 Employer: get jobs

`app/api/employer/jobs/route.ts`

```ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import Job from "@/models/Job";
import { auth } from "@/auth";

export async function GET() {
  await connectDB();
  const session = await auth();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const jobs = await Job.find({ employerId: session.user.id }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ success: true, jobs });
}
```

---

### 8.8 Employer: dashboard stats

`app/api/employer/dashboard/route.ts` (or /stats)

```ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import Job from "@/models/Job";
import Application from "@/models/Application";
import { auth } from "@/auth";

export async function GET() {
  try {
    await connectDB();
    const session = await auth();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const employerId = session.user.id;
    const jobs = await Job.find({ employerId });

    const totalJobs = jobs.length;
    const jobIds = jobs.map(j => j._id);
    const totalApplicants = await Application.countDocuments({ jobId: { $in: jobIds } });
    const activeJobs = await Job.countDocuments({ employerId, isActive: true });

    const jobStats = await Promise.all(jobs.map(async (job) => {
      const count = await Application.countDocuments({ jobId: job._id });
      return { name: job.title, applicants: count };
    }));

    return NextResponse.json({ success: true, data: { totalJobs, totalApplicants, activeJobs, jobStats } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
```

---

### 8.9 Employer: applicants for job

`app/api/employer/job/[jobId]/applicants/route.ts`

```ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import Application from "@/models/Application";
import { auth } from "@/auth";

export async function GET(req, { params }: { params: { jobId: string } }) {
  await connectDB();
  const session = await auth();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { jobId } = params;
  const applicants = await Application.find({ jobId }).populate("seekerId", "name email department skills").sort({ createdAt: -1 }).lean();
  return NextResponse.json({ success: true, applicants });
}
```

---

## 9. Frontend - Seeker

### 9.1 Layout notes

* Seeker `layout.tsx` wraps seeker pages, contains sidebar and header.
* All seeker pages are nested in `app/dashboard/seeker/...`.

---

### 9.2 Seeker Dashboard (client component)

`app/dashboard/seeker/page.tsx`

```tsx
'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface Job { _id: string; title: string; company?: string; location?: string; salaryRange?: string; }

export default function SeekerDashboardPage() {
  const { data: session } = useSession();
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [applicationsCount, setApplicationsCount] = useState<number>(0);
  const [profileProgress, setProfileProgress] = useState<number>(0);
  const [recentApps, setRecentApps] = useState<any[]>([]);

  useEffect(() => {
    async function fetch() {
      try {
        const [jobsRes, appsRes, recentRes, profileRes] = await Promise.all([
          axios.get('/api/jobs/recommended'),
          axios.get('/api/applications/count'),
          axios.get('/api/applications/recent'),
          axios.get('/api/seeker/profile')
        ]);
        if (jobsRes.data.success) setRecommendedJobs(jobsRes.data.jobs || []);
        if (appsRes.data.success) setApplicationsCount(appsRes.data.count || 0);
        if (recentRes.data.success) setRecentApps(recentRes.data.applications || []);
        if (profileRes.data.success) {
          const user = profileRes.data.user;
          const filled = ['name','email','department','skills','resumeURL'].reduce((acc, key) => acc + (user[key] ? 1 : 0), 0);
          setProfileProgress(Math.round((filled / 5) * 100));
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetch();
  }, []);

  return (
    <div className="space-y-8">
      <header>Welcome back, {session?.user?.name}</header>
      <div>Profile: {profileProgress}%</div>
      <div>Applications: {applicationsCount}</div>
      <div>
        <h2>Recommended Jobs</h2>
        {recommendedJobs.slice(0,3).map(j => <div key={j._id}>{j.title}</div>)}
      </div>
      <div>
        <h2>Recent Applications</h2>
        {recentApps.map(r => <div key={r._id}>{r.jobId?.title || 'Unknown'}</div>)}
      </div>
    </div>
  );
}
```

**Explanation highlights:**

* Fetches multiple endpoints in parallel.
* Calculates profile completion as percent of selected fields filled.

---

### 9.3 Browse Jobs + Apply Modal

`components/ApplyModal.tsx`

```tsx
'use client';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface ApplyModalProps { job: { _id: string; title: string }; onClose: () => void; }

export default function ApplyModal({ job, onClose }: ApplyModalProps) {
  const [coverLetter, setCoverLetter] = useState('');
  const [location, setLocation] = useState('');
  const [resume, setResume] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume) return toast.error('Please upload your resume');
    const fd = new FormData();
    fd.append('jobId', job._id);
    fd.append('coverLetter', coverLetter);
    fd.append('location', location);
    fd.append('resume', resume);
    setLoading(true);
    try {
      const { data } = await axios.post('/api/applications', fd);
      if (data.success) {
        toast.success('Application submitted!');
        onClose();
      } else toast.error('Failed to submit');
    } catch (err) { toast.error('Error applying'); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg">
        <h3>Apply for {job.title}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" placeholder="Location" value={location} onChange={e=>setLocation(e.target.value)} />
          <input type="file" accept=".pdf" onChange={e => setResume(e.target.files?.[0] || null)} />
          <textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

`app/dashboard/seeker/browse-jobs/page.tsx` uses `ApplyModal`:

```tsx
// fetch jobs, filter, hold selectedJob state and render <ApplyModal job={selectedJob} onClose={() => setSelectedJob(null)} />
```

**Important:** after a successful application you should refresh `appliedJobs` or `recommendedJobs` so UI updates.

---

### 9.4 My Applications page

`app/dashboard/seeker/my-applications/page.tsx` fetches `/api/applications` (a route that returns all applications for the logged-in user) and lists applications with status badges.

---

### 9.5 Seeker Profile page

`app/dashboard/seeker/profile/page.tsx` uses `GET /api/seeker/profile` to prefill fields and `PUT /api/seeker/profile` to update department and skills.

---

## 10. Frontend - Employer

### 10.1 Layout & Sidebar

Place employer pages under `app/dashboard/employer/`. Sidebar nav items:

```ts
const navItems = [
  { name: 'Dashboard', href: '/dashboard/employer' },
  { name: 'Add Jobs', href: '/dashboard/employer/addjob' },
  { name: 'Jobs', href: '/dashboard/employer/jobs' },
];
```

### 10.2 Employer Dashboard

`app/dashboard/employer/page.tsx` (client component):

* Calls `/api/employer/dashboard` to get `totalJobs`, `totalApplicants`, `activeJobs`, and `jobStats` for the chart.
* Renders Recharts `BarChart` with `jobStats`.

### 10.3 Job List & Applicants

`app/dashboard/employer/jobs/page.tsx` lists employer jobs by calling `/api/employer/jobs`. Each job links to `/dashboard/employer/job/[jobId]`.

`app/dashboard/employer/job/[jobId]/page.tsx` fetches `/api/employer/job/${jobId}/applicants` and lists each applicant with name, email, skills, cover letter and `resumeURL` link.

---

## 11. Tips, common issues and improvements

### Cloudinary file URLs & resource_type

* PDFs: use `resource_type: 'auto'` or `'raw'`.
* If the returned URL lacks `.pdf`, set `format: 'pdf'` or `public_id` and `use_filename: true`.
* Use `secure_url` to store HTTPS link.

### Environment variables: security

* Never put API keys in `NEXT_PUBLIC_*`. Keep them server-only.
* Only `CLOUDINARY_CLOUD_NAME` is safe to expose if you do client-side unsigned uploads (not needed here).

### Prevent duplicate applications

* Add a server-side check in `/api/applications` to prevent the same seeker applying twice:

  ```ts
  const exists = await Application.findOne({ jobId, seekerId: session.user.id });
  if (exists) return NextResponse.json({ success: false, message: "Already applied" }, { status: 400 });
  ```

### Handling missing fields in existing users

* Use `updateMany` to add defaults to existing docs:

  ```ts
  await User.updateMany({ department: { $exists: false } }, { $set: { department: "" } });
  ```

### Performance

* Avoid `N` queries in `Promise.all` that fetch counts for each job — consider aggregation pipeline to compute applicant counts in a single query for large datasets.
* Use indexes on `jobId`, `seekerId` fields.

---

## 12. Appendix — helper snippets

### Prevent double apply (server side)

```ts
const existing = await Application.findOne({ jobId, seekerId: session.user.id });
if (existing) return NextResponse.json({ success: false, message: 'Already applied' }, { status: 400 });
```

### Aggregation example (applicant counts per job)

```ts
// Using aggregation to get counts in one query
const counts = await Application.aggregate([
  { $match: { jobId: { $in: jobIds } } },
  { $group: { _id: "$jobId", count: { $sum: 1 } } }
]);
```

### Constructing download URL when raw upload used

If you have `uploadResult.public_id` and resource type `raw`:

```
https://res.cloudinary.com/<cloud_name>/raw/upload/v<version>/<public_id>.pdf
```

But prefer `secure_url` returned by Cloudinary.

---

## Final notes

You now have the essential code and full explanations for a working two-sided job marketplace:

* Seeker: register via NextAuth, edit profile, browse jobs, upload resume to Cloudinary, apply to jobs, and track applications.
* Employer: create jobs, list jobs, see applicants, and view analytics.

Tomorrow you planned to continue with employer pages; with this doc you can review everything in VS Code and pick up right where you left off.

If you want, I can:

* generate a downloadable `.md` file and provide a link, or
* split the sections into separate smaller files (but you requested one single file).

Say “please generate file” and I’ll output a file you can download, or copy-paste this markdown into your file `JobPortal_Full_Documentation.md`.

---

Would you like me to save this as a file now so you can download (yes/no)?
