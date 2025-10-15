'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function SelectRolePage() {
  const { data: session, status } = useSession();
  const [role, setRole] = useState<'seeker' | 'employer' | ''>('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // wait for session
    if (!session) {
      router.push('/login');
      return;
    }

    // ✅ Check if user already has a role
    if (session?.user?.role) {
      router.push(`/dashboard/${session.user.role}`);
    } else {
      setLoading(false); // Show role selection form
    }
  }, [session, status, router]);

  const handleSave = async () => {
    if (!role) return alert('Please select a role');
    setLoading(true);
    try {
      await axios.put('/api/user/role', { role });
      router.push(`/dashboard/${role}`);
    } catch (error) {
      console.error('Failed to update role:', error);
      setLoading(false);
    }
  };

  // ✅ Show spinner while checking role
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mb-4"></div>
        <p className="text-gray-700 text-lg font-medium">
          Identifying your role...
        </p>
      </div>
    );
  }

  // ✅ Show role selection once loading finishes
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Choose Your Role
        </h1>

        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="role"
              value="seeker"
              checked={role === 'seeker'}
              onChange={() => setRole('seeker')}
              className="w-4 h-4 text-blue-600"
            />
            <span>I’m a Job Seeker</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="role"
              value="employer"
              checked={role === 'employer'}
              onChange={() => setRole('employer')}
              className="w-4 h-4 text-blue-600"
            />
            <span>I’m an Employer</span>
          </label>
        </div>

        <button
          onClick={handleSave}
          className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
