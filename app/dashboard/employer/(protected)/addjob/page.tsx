'use client';
import axios, { AxiosError } from 'axios';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

const Page: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [skills, setSkills] = useState<string>('');
  const [salaryRange, setSalaryRange] = useState<string>('');
  const [jobType, setJobType] = useState<'onsite' | 'remote' | 'contract'>('remote');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title || !description || !skills || !location || !salaryRange || !jobType) {
      toast.error('Please fill out all fields');
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post('/api/employer/jobs', {
        title,
        description,
        location,
        skills,
        salaryRange,
        jobType,
      });

      if (data.success) {
        toast.success('Job posted successfully!');
        setTitle('');
        setDescription('');
        setLocation('');
        setSkills('');
        setSalaryRange('');
        setJobType('remote');
      } else {
        toast.error('Failed to post job');
      }
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      toast.error(err.response?.data?.message || 'Internal server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Create New Job</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            type="text"
            placeholder="Job Title"
            className="border p-2 rounded-lg"
          />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            type="text"
            placeholder="Location"
            className="border p-2 rounded-lg"
          />
          <input
            value={salaryRange}
            onChange={(e) => setSalaryRange(e.target.value)}
            type="text"
            placeholder="Salary Range"
            className="border p-2 rounded-lg"
          />
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value as 'onsite' | 'remote' | 'contract')}
            className="border p-2 rounded-lg"
          >
            <option value="">Job Type</option>
            <option value="onsite">Onsite</option>
            <option value="remote">Remote</option>
            <option value="contract">Contract</option>
          </select>
        </div>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Job Description"
          className="border p-2 rounded-lg mt-4 w-full"
          rows={4}
        ></textarea>

        <input
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          type="text"
          placeholder="Required Skills (comma-separated)"
          className="border p-2 rounded-lg mt-4 w-full"
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-6 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
        >
          {loading ? 'Posting...' : 'Post Job'}
        </button>
      </form>
    </section>
  );
};

export default Page;
