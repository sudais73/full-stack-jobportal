'use client'; 

import { useState, ReactNode } from 'react'; 
import Link from 'next/link'; 
import { usePathname } from 'next/navigation'; 
import {
  FaChartLine,
  FaBriefcase,
  FaClipboardList,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUser,
} from 'react-icons/fa';
import { signOut } from 'next-auth/react';

interface SeekerLayoutProps {
  children: ReactNode;
}

export default function SeekerLayout({ children }: SeekerLayoutProps) { 
  const pathname = usePathname(); 
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false); 

  const navItems = [ 
    { name: 'Dashboard', href: '/dashboard/seeker', icon: FaChartLine }, 
    { name: 'Browse Jobs', href: '/dashboard/seeker/browse-jobs', icon: FaBriefcase }, 
    { name: 'Applications', href: '/dashboard/seeker/applications', icon: FaClipboardList }, 
     { name: 'Profile', href: '/dashboard/seeker/profile', icon:FaUser },
  ]; 

  const handleLogout = async (): Promise<void> => { 
    await signOut({ redirect: true, callbackUrl: '/' }); 
  };

  const handleNavClick = (): void => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarOpen(false); 
    } 
  }; 

  return ( // 26
    <div className="flex h-screen bg-gray-100"> 
      {/* mobile toggle */} 
      <button
        type="button"
        aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-indigo-600 text-white md:hidden"
        onClick={() => setSidebarOpen((prev) => !prev)} 
      >
        {sidebarOpen ? <FaTimes /> : <FaBars />} 
      </button>

      {/* Sidebar */} 
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r shadow-md transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0`}
      >
        <div className="p-4 border-b">
          <h1 className="text-2xl font-semibold text-center">Find Jobs</h1> 
        </div>

        <nav className="flex-1 px-2 py-4 space-y-2"> 
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleNavClick}
              className={`flex items-center px-4 py-2 rounded-md transition duration-200
                ${pathname === item.href ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}
            >
              <item.icon /> {/* 34 */}
              <span className="ml-3">{item.name}</span> 
            </Link>
          ))}

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 mt-4 rounded-md transition duration-200 hover:bg-red-600 hover:text-white text-gray-700"
          >
            <FaSignOutAlt className="mr-3" /> 
            Logout
          </button>
        </nav>
      </aside>

      {/* Main content */} 
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow p-4 hidden md:block">
          <h2 className="text-xl font-semibold">
            {navItems.find((item) => pathname === item.href)?.name || 'Seeker Dashboard'} 
          </h2>
        </header>

        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </main>
    </div>
  ); 
} 
