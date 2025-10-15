'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function SeekerProfilePage() {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    department: '',
    skills: '',
    resumeURL: '',
  });

  // ✅ Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get('/api/seeker/profile');
        if (data.success && data.user) {
          setProfile({
            name: data.user.name || '',
            email: data.user.email || '',
            department: data.user.department || '',
            skills: (data.user.skills || []).join(', '),
            resumeURL: data.user.resumeURL || '',
          });
        }
      } catch (err:any) {
        toast.error('Failed to load profile', err);
      }
    };
    fetchProfile();
  }, []);

  // ✅ Handle save/update
  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await axios.put('/api/seeker/profile', {
        department: profile.department,
        skills: profile.skills.split(',').map((s) => s.trim()),
      });
      if (data.success) toast.success('Profile updated successfully!');
    } catch (err:any) {
      toast.error('Error saving profile', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Your Profile</h1>

      <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
        <div>
          <label className="block text-gray-600 text-sm font-medium">Name</label>
          <input
            type="text"
            value={profile.name}
            disabled
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-gray-600 text-sm font-medium">Email</label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-gray-600 text-sm font-medium">Department</label>
          <input
            type="text"
            value={profile.department}
            onChange={(e) => setProfile({ ...profile, department: e.target.value })}
            placeholder="e.g. Software Engineering, Marketing"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="block text-gray-600 text-sm font-medium">Skills</label>
          <input
            type="text"
            value={profile.skills}
            onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
            placeholder="e.g. React, Node.js, MongoDB"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">Separate skills with commas</p>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition w-full"
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}
