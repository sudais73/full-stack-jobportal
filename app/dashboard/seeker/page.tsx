'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { FaBriefcase, FaCheckCircle, FaClipboardCheck, FaClock, FaTimesCircle, FaUserCircle } from 'react-icons/fa';

interface Job {
  _id: string;
  title: string;
  company?: string;
  location?: string;
  salaryRange?: string;
}

interface Application {
  _id: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  jobId: {
    title: string;
    company?: string;
    location?: string;
    jobType: string;
  };
}
export default function SeekerDashboardPage() {
  const { data: session } = useSession();
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [recentApp, setRecentApp] = useState<Application[]>([]);
  const [applicationsCount, setApplicationsCount] = useState<number>(0);

  // Fetch some example dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [jobsRes, appsRes] = await Promise.all([
          axios.get('/api/jobs/recommended'), // backend endpoint for suggested jobs
          axios.get('/api/applications'),
        ]);

        if (jobsRes.data?.success) setRecommendedJobs(jobsRes.data.jobs || []);
        if (appsRes.data?.success) setApplicationsCount(appsRes.data.count || 0);
        if (appsRes.data?.success) setRecentApp(appsRes.data.recent || '');




      } catch (err) {
        console.error('Error loading dashboard data', err);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Welcome back, {session?.user?.name || 'Job Seeker'} 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Here’s an overview of your job search progress.
          </p>
        </div>
        <FaUserCircle className="text-gray-400 text-5xl" />
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  
        {/* Applications */}
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center">
          <FaClipboardCheck className="text-indigo-600 text-3xl mb-2" />
          <h2 className="font-semibold text-gray-700">{applicationsCount}</h2>
          <p className="text-gray-500 text-sm">Applications Submitted</p>
        </div>

        {/* Recommended jobs count */}
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center">
          <FaBriefcase className="text-indigo-600 text-3xl mb-2" />
          <h2 className="font-semibold text-gray-700">{recommendedJobs.length}</h2>
          <p className="text-gray-500 text-sm">Recommended Jobs</p>
        </div>
      </div>

      {/* Recommended jobs preview */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Recommended Jobs</h2>
          <Link
            href="/dashboard/seeker/browse-jobs"
            className="text-indigo-600 hover:underline text-sm"
          >
            View All →
          </Link>
        </div>

        {recommendedJobs.length === 0 ? (
          <p className="text-gray-500 text-sm">No job recommendations yet.</p>
        ) : (
          <div className="space-y-4">
            {recommendedJobs.slice(0, 3).map((job) => (
              <div
                key={job._id}
                className="p-4 border rounded-lg hover:shadow-sm transition"
              >
                <h3 className="font-semibold text-gray-800">{job.title}</h3>
                <p className="text-gray-500 text-sm">
                  {job.company || 'Unknown Company'} • {job.location || 'Location N/A'}
                </p>
                <p className="text-sm text-indigo-600 mt-1">
                  {job.salaryRange || 'Negotiable'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent applications */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Recent Applications
        </h2>
        {recentApp.length === 0 ? (<p className="text-gray-500 text-sm">
          You haven’t applied to any jobs recently.
        </p>) :


          <div className="space-y-4">
            {recentApp.map((app) => (
              <div
                key={app._id}
                className="bg-white p-6 rounded-xl shadow-md flex justify-between items-center hover:shadow-lg transition"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{app.jobId.title}</h2>
                  <p className="text-gray-500 text-sm">{app.jobId.company || 'Unknown Company'}</p>
                  <p className="text-gray-400 text-sm">
                    {app.jobId.location} • {app.jobId.jobType}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-gray-400 text-sm mb-2">
                    Applied on {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium ${app.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : app.status === 'accepted'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                  >
                    {app.status === 'pending' && <FaClock />}
                    {app.status === 'accepted' && <FaCheckCircle />}
                    {app.status === 'rejected' && <FaTimesCircle />}
                    {/* {app.status.charAt(0).toUpperCase() + app.status.slice(1)} */}
                  </span>
                </div>
              </div>
            ))}
          </div>
        }


      </div>
    </div>
  );
}
