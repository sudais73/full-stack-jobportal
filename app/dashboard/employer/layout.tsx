'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FaBoxes,
  FaChartLine,
  FaSignOutAlt,
  FaTimes,
  FaBars,
  FaPlus,
} from 'react-icons/fa';
import { signOut } from 'next-auth/react';

interface EmployerLayoutProps {
  children: ReactNode;
}

export default function EmployerLayout({ children }: EmployerLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard/employer', icon: FaChartLine },
    { name: 'Add Job', href: '/dashboard/employer/addjob', icon: FaPlus },
    { name: 'Jobs', href: '/dashboard/employer/jobs', icon: FaBoxes },
  ];

  // ✅ Logout
  const handleLogout = async (): Promise<void> => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  // ✅ Close sidebar on mobile
  const handleNavClick = (): void => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 max-md:mt-20">
      {/* Mobile Sidebar Toggle Button */}
      <button
        type="button"
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-indigo-600 text-white md:hidden"
        onClick={() => setSidebarOpen((prev) => !prev)} // ✅ fixed arrow function typing
      >
        {sidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 text-white transition-transform duration-300 ease-in-out 
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:flex-shrink-0`}
      >
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-2xl font-semibold text-center">
            Employer Dashboard
          </h1>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleNavClick}
              className={`flex items-center px-4 py-2 rounded-md transition duration-200 
                ${
                  pathname === item.href
                    ? 'bg-indigo-700 text-white'
                    : 'hover:bg-gray-700 hover:text-white'
                }`}
            >
              <item.icon />
              <span className="ml-3">{item.name}</span>
            </Link>
          ))}

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 rounded-md transition duration-200 hover:bg-red-700 hover:text-white text-red-300 mt-4"
          >
            <FaSignOutAlt className="mr-3" />
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow p-4 hidden md:block">
          <h2 className="text-xl font-semibold">
            {navItems.find((item) => pathname === item.href)?.name ||
              'Employer Panel'}
          </h2>
        </header>

        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </main>
    </div>
  );
}
