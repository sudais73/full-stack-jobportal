'use client';
import { signIn} from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
const SignInPage: React.FC = () => {

 return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-md">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <Image src="/logo.jpg" alt="SmartWork logo" width={102} height={32} />
          <span className="ml-2 text-xl font-semibold text-gray-800">
            Job Portal
          </span>
        </div>

        {/* Title */}
        <h2 className="mb-6 text-center text-2xl font-semibold text-gray-800">
          Sign in to Job Portal
        </h2>

        {/* Google Sign-in */}
        <button
          onClick={() => signIn('google', {callbackUrl:'/select-role'})}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 py-2 text-gray-700 transition hover:bg-gray-100"
        >
          <Image src="/google-logo.webp" alt="Google" width={20} height={20} />
          Sign in with Google
        </button>

        {/* GitHub Sign-in */}
        <button
          onClick={() => signIn('github', {callbackUrl:'/select-role'})}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 py-2 text-gray-700 transition hover:bg-gray-100"
        >
          <Image src="/github-mark.png" alt="GitHub" width={20} height={20} />
          Sign in with GitHub
        </button>

        {/* Divider */}
        <div className="my-6 flex items-center justify-center text-gray-400 text-sm">
          <span className="border-t border-gray-200 w-1/4"></span>
          <span className="mx-2">or</span>
          <span className="border-t border-gray-200 w-1/4"></span>
        </div>

        {/* Email sign-in */}
        <Link
          href="/login"
          
          className="block text-center text-sm font-medium text-indigo-600 hover:underline"
        >
          Sign in with email
        </Link>

        {/* Sign-up link */}
        <p className="mt-4 text-center text-sm text-gray-500">
          Don’t have an account?{' '}
          <Link href="/login" className="text-indigo-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignInPage;