import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/dbConnect';
import Job from '@/models/Job';
import Application from '@/models/Application';
import { auth } from '@/auth';
import mongoose, { FilterQuery } from 'mongoose';
import User from '@/models/user';

interface JobDoc {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  skills?: string[];
  department?: string;
}

export async function GET() {
  try {
    await connectDB();

    // ✅ 1. Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // ✅ 2. Get user info
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const userSkills = user.skills || [];
    const userDepartment = user.department?.toLowerCase();

    // ✅ 3. Find jobs already applied by this user
    const appliedApps = await Application.find({ seekerId: user._id }, 'jobId');
    const appliedJobIds = appliedApps.map(
      (a) => new mongoose.Types.ObjectId(a.jobId)
    );

    // ✅ 4. Build recommendation query with proper type
    const query: FilterQuery<JobDoc> = {
      _id: { $nin: appliedJobIds },
    };

    if (userSkills.length > 0 || userDepartment) {
      query.$or = [];

      // Match based on skills
      if (userSkills.length > 0) {
        query.$or.push({ skills: { $in: userSkills } });
      }

      // Match based on department keywords
      if (userDepartment) {
        query.$or.push({
          $or: [
            { title: { $regex: userDepartment, $options: 'i' } },
            { description: { $regex: userDepartment, $options: 'i' } },
          ],
        });
      }
    }

    // ✅ 5. Fetch top recommended jobs
    const jobs = await Job.find(query).limit(10).lean();

    return NextResponse.json({ success: true, jobs });
  } catch (error) {
    console.error('Recommended jobs error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
