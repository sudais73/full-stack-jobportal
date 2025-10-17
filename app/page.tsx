'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col md:flex-row items-center justify-between bg-gradient-to-br from-indigo-50 via-white to-indigo-100 px-8 md:px-20 py-12">
      {/* Left content section */}
      <motion.div
        className="text-center md:text-left md:w-1/2 space-y-6"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 leading-tight">
          Find Your Dream Job with{' '}
          <span className="text-indigo-600">JobConnect</span>
        </h1>

        <p className="text-gray-600 max-w-md mx-auto md:mx-0">
          A smart job portal that connects talented seekers and employers efficiently.
          Powered by AI to match skills, analyze profiles, and simplify hiring.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
          <Link
            href="/login"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Get Started
          </Link>
          <Link
            href="#"
            className="text-indigo-600 font-medium hover:underline"
          >
            Learn More
          </Link>
        </div>

        <motion.div
          className="mt-8 text-sm text-gray-500 flex items-center justify-center md:justify-start gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Sparkles className="w-4 h-4 text-yellow-500" />
          <span>AI-powered matching coming soon</span>
        </motion.div>
      </motion.div>

      {/* Right image section */}
      <motion.div
        className="md:w-1/2 mt-12 md:mt-0 flex justify-center"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Image
        width={1000}
        height={500}
          src="/landing.avif"
          alt="Hero Illustration"
          className="w-full max-w-md md:max-w-lg rounded-lg h-full"
        />
      </motion.div>
    </main>
  );
}
