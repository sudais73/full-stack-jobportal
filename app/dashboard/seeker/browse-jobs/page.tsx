'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaMapMarkerAlt, FaMoneyBillWave, FaBriefcase } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import ApplyModal from '@/components/ApplyModal';

interface Job {
  _id: string;
  title: string;
  company?: string;
  location?: string;
  salaryRange?: string;
  jobType: 'onsite' | 'remote' | 'contract';
  skills?: string[];
}

export default function BrowseJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]); // ✅ store applied job IDs
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'onsite' | 'remote' | 'contract'>('all');
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // ✅ Fetch all jobs
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get('/api/jobs');
        if (data.success) setJobs(data.jobs);
        else toast.error('Failed to load jobs');
      } catch (err) {
        console.error(err);
        toast.error('Error fetching jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // ✅ Fetch user's applied jobs
  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const { data } = await axios.get('/api/applications/user');
        if (data.success) setAppliedJobs(data.appliedJobIds);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAppliedJobs();
  }, []);

  // ✅ Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.location?.toLowerCase().includes(search.toLowerCase()) ||
      job.skills?.some((skill) => skill.toLowerCase().includes(search.toLowerCase()));

    const matchesType = filterType === 'all' || job.jobType === filterType;

    return matchesSearch && matchesType;
  });

  // ✅ Modal controls
  const handleOpenApplyModal = (job: Job) => setSelectedJob(job);
  const handleCloseApplyModal = () => setSelectedJob(null);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">Browse Jobs</h1>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by title, skill, or location"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'onsite' | 'remote' | 'contract')}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Types</option>
            <option value="onsite">Onsite</option>
            <option value="remote">Remote</option>
            <option value="contract">Contract</option>
          </select>

        </div>
      </div>

      {/* Jobs */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <p className="text-gray-500 text-center py-10">No jobs found.</p>
        ) : (
          filteredJobs.map((job) => {
            const alreadyApplied = appliedJobs.includes(job._id);
            return (
              <div
                key={job._id}
                className="bg-white p-6 rounded-xl shadow-md flex flex-col md:flex-row justify-between md:items-center hover:shadow-lg transition"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{job.title}</h2>
                  <p className="text-gray-500 text-sm">{job.company || 'Unknown Company'}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                    <span className="flex items-center gap-1">
                      <FaMapMarkerAlt className="text-indigo-500" /> {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaMoneyBillWave className="text-green-500" /> {job.salaryRange}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaBriefcase className="text-gray-400" /> {job.jobType}
                    </span>
                  </div>

                  {job.skills && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {job.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="bg-indigo-100 text-indigo-600 px-2 py-1 rounded-md text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {alreadyApplied ? (
                  <button
                    disabled
                    className="mt-4 md:mt-0 bg-gray-400 text-white px-5 py-2 rounded-lg cursor-not-allowed"
                  >
                    Applied
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenApplyModal(job)}
                    className="mt-4 md:mt-0 bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition"
                  >
                    Apply Now
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {selectedJob && <ApplyModal job={selectedJob} onClose={handleCloseApplyModal} />}
    </div>
  );
}
