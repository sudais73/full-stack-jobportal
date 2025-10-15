'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Applicant {
  _id: string;
  seekerId: {
    _id: string;
    name: string;
    email: string;
    department?: string;
    skills?: string[];
  };
  coverLetter?: string;
  resumeURL?: string;
  location?: string;
  createdAt: string;
  status?: 'pending' | 'accepted' | 'rejected';
}

export default function JobApplicantsPage() {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch applicants
  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const { data } = await axios.get(`/api/employer/jobs/${jobId}/applicants`);
        if (data.success) {
          setApplicants(data.applicants);
        } else {
          toast.error('Failed to load applicants');
        }
      } catch (err) {
        console.error(err);
        toast.error('Error fetching applicants');
      } finally {
        setLoading(false);
      }
    };

    if (jobId) fetchApplicants();
  }, [jobId]);

  // ✅ Handle status update
  const handleStatusChange = async (
    seekerId: string,
    newStatus: 'pending' | 'accepted' | 'rejected'
  ) => {
    try {
      const res = await fetch('/api/applications/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, seekerId, status: newStatus }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Status updated successfully!');
        setApplicants((prev) =>
          prev.map((app) =>
            app.seekerId._id === seekerId ? { ...app, status: newStatus } : app
          )
        );
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong');
    }
  };

  // ✅ Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 animate-pulse">Loading applicants...</p>
      </div>
    );
  }

  // ✅ Main UI
  return (
    <section className="p-4 sm:p-6 md:p-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800 text-center sm:text-left">
        Applicants
      </h1>

      {applicants.length === 0 ? (
        <p className="text-gray-500 text-center">No applicants yet for this job.</p>
      ) : (
        <div className="space-y-4">
          {applicants.map((app) => (
            <div
              key={app._id}
              className="bg-white p-4 sm:p-6 rounded-xl shadow-md transition-transform duration-200 hover:scale-[1.01]"
            >
              {/* Header section */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-800 break-words">
                    {app.seekerId.name}
                  </h2>
                  <p className="text-sm text-gray-500 break-all">{app.seekerId.email}</p>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
                  {app.resumeURL && (
                    <Link
                      href={app.resumeURL}
                      target="_blank"
                      className="text-indigo-600 hover:underline text-sm truncate"
                    >
                      View Resume
                    </Link>
                  )}

                  {/* ✅ Status Dropdown for Employer */}
                  <select
                    value={app.status || 'pending'}
                    onChange={(e) =>
                      handleStatusChange(
                        app.seekerId._id,
                        e.target.value as 'pending' | 'accepted' | 'rejected'
                      )
                    }
                    className="border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
                  >
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Applicant info */}
              <p className="text-gray-700 mb-2 text-sm sm:text-base">
                <span className="font-medium">Department:</span>{' '}
                {app.seekerId.department || 'N/A'}
              </p>

              {app.seekerId.skills && app.seekerId.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {app.seekerId.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-indigo-100 text-indigo-600 px-2 py-1 rounded-md text-xs sm:text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {app.coverLetter && (
                <p className="text-gray-600 text-sm mt-2 break-words">
                  <span className="font-medium">Cover Letter:</span>{' '}
                  {app.coverLetter}
                </p>
              )}

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-3 gap-1 sm:gap-0">
                <p className="text-gray-500 text-xs">
                  Applied on {new Date(app.createdAt).toLocaleDateString()}
                </p>
                <p className="text-gray-700 text-sm">
                  <span className="font-medium">Status:</span>{' '}
                  <span
                    className={`font-semibold ${
                      app.status === 'accepted'
                        ? 'text-green-600'
                        : app.status === 'rejected'
                        ? 'text-red-600'
                        : 'text-yellow-600'
                    }`}
                  >
                    {app.status || 'Pending'}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
