'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import toast from 'react-hot-toast';

interface JobStat {
  name: string;
  applicants: number;
}

interface DashboardData {
  totalJobs: number;
  totalApplicants: number;
  activeJobs: number;
  jobStats: JobStat[];
}

export default function EmployerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/employer/jobs');
        if (res.data.success) {
          setData(res.data.stats);
        } else {
          toast.error('Failed to load dashboard data');
        }
      } catch (error) {
        console.error(error);
        toast.error('Error loading dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <main className="flex-1 p-4 sm:p-6 md:p-8 w-full overflow-x-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-indigo-600 rounded-full"></div>
          </div>
        ) : (
          <section>
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 text-center sm:text-left">
              Employer Dashboard
            </h1>

            {/* ✅ Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10">
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md text-center">
                <h2 className="text-gray-500 text-sm sm:text-base">Total Jobs</h2>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                  {data?.totalJobs ?? 0}
                </p>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md text-center">
                <h2 className="text-gray-500 text-sm sm:text-base">Applicants</h2>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">
                  {data?.totalApplicants ?? 0}
                </p>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md text-center">
                <h2 className="text-gray-500 text-sm sm:text-base">Active Jobs</h2>
                <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                  {data?.totalJobs ?? 0}
                </p>
              </div>
            </div>

            {/* ✅ Bar chart section */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 text-center sm:text-left">
                Applicants per Job
              </h2>

              {data?.jobStats?.length ? (
                <div className="w-full h-[250px] sm:h-[300px] md:h-[350px] overflow-x-auto">
                  <div className="min-w-[400px] sm:min-w-full h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.jobStats}
                        margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
                      >
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 10 }}
                          interval={0}
                          angle={-25}
                          textAnchor="end"
                          height={50}
                        />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar
                          dataKey="applicants"
                          fill="#2563eb"
                          radius={[6, 6, 0, 0]}
                          barSize={40}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-10">
                  No data available yet.
                </p>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
