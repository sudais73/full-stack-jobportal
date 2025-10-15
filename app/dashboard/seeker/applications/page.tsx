'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

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

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get('/api/applications');
        if (data.success) {
          setApplications(data.data);
          
        } else {
          toast.error('Failed to fetch applications');
        }
      } catch (error) {
        console.error(error);
        toast.error('Error loading applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-gray-800">My Applications</h1>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : applications.length === 0 ? (
        <p className="text-gray-500 text-center py-10">You haven’t applied for any jobs yet.</p>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
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
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium ${
                    app.status === 'pending'
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
      )}
    </div>
  );
}
