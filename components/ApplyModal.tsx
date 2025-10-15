'use client';

import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface ApplyModalProps {
  job: {
    _id: string;
    title: string;
  };
  onClose: () => void;
}

export default function ApplyModal({ job, onClose }: ApplyModalProps) {
  const [coverLetter, setCoverLetter] = useState('');
  const [location, setLocation] = useState('');
  const [resume, setResume] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume) return toast.error('Please upload your resume');

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('jobId', job._id);
      formData.append('coverLetter', coverLetter);
      formData.append('location', location);
      formData.append('resume', resume);

      const { data } = await axios.post('/api/applications', formData);
      if (data.success) {
        toast.success('Application submitted successfully!');
        onClose();
      } else {
        toast.error('Failed to submit application');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error applying for job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 text-lg"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Apply for {job.title}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Your current city"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Cover Letter</label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              rows={4}
              placeholder="Why are you a good fit?"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Resume (PDF)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setResume(e.target.files?.[0] || null)}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}
