import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/dbConnect';
import { auth } from '@/auth';
import User from '@/models/user';

export async function GET() {
  try {
    await connectDB();
    const session = await auth();

    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email }).lean();
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('GET profile error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { department, skills } = await req.json();

    const updated = await User.findOneAndUpdate(
      { email: session.user.email },
      { department, skills },
      { new: true }
    );

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error('PUT profile error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
