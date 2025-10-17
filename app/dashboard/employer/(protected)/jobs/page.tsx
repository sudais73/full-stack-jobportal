'use client';
import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface Job {
  _id: string;
  title: string;
  description?: string;
  jobType: 'onsite' | 'remote' | 'contract';
  salaryRange: string;
}

export default function EmployerJobList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const getJobs = async () => {
      try {
        const { data } = await axios.get<{ success: boolean; jobs: Job[] }>('/api/employer/jobs');

        if (data.success && data.jobs) {
          setJobs(data.jobs);
          console.log(data.jobs);
        } else {
          toast.error('Error getting jobs');
        }
      } catch (error) {
        const err = error as AxiosError<{ message?: string }>;
        toast.error(err.response?.data?.message || 'Error getting jobs');
      } finally {
        setLoading(false);
      }
    };

    getJobs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 animate-pulse">Loading jobs...</p>
      </div>
    );
  }

  return (
    <section>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Your Posted Jobs</h1>

      {jobs.length === 0 ? (
        <p className="text-gray-500 text-center">No jobs posted yet.</p>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white p-6 rounded-xl shadow-md flex justify-between items-center"
            >
              <div>
                <h2 className="text-lg font-semibold text-gray-800">{job.title}</h2>
                <p className="text-gray-500">
                  {job.jobType} | {job.salaryRange}
                </p>
              </div>
              <Link
                href={`/dashboard/employer/jobs/${job._id}`}
                className="text-blue-600 hover:underline font-medium"
              >
                View Applicants →
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
