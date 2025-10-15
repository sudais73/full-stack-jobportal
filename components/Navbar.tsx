'use client';

import React from 'react';
import {signOut, useSession } from "next-auth/react";


export default function Navbar() {
const{data:session} = useSession()


  return (
    <nav className="w-full border-b p-4 flex justify-between items-center">
      <div className="font-bold text-xl md:text-2xl max-md:pl-10">Job Portal</div>
      <div>
        { session?.user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm">{session.user.name ?? session.user.email}</span>
            <button onClick={() => signOut({ callbackUrl: '/' })} className="px-3 py-1 border rounded">
              Sign out
            </button>
          </div>
        ) : (
          <a href="/login" className="px-3 py-1 border rounded">
            Sign in
          </a>
        )}
      </div>
    </nav>
  );
}