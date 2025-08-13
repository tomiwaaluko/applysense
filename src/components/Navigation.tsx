"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { DashboardIcon, BriefcaseIcon, UploadIcon, UserIcon } from "./icons";

interface NavigationProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

export function Navigation({ user }: NavigationProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!user) {
    return (
      <nav className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <div className="bg-gradient-primary flex h-10 w-10 items-center justify-center rounded-xl">
                  <BriefcaseIcon className="h-6 w-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-2xl font-bold text-transparent">
                  Job Tracker
                </span>
              </Link>
            </div>
            <div className="flex items-center">
              <Link
                href="/api/auth/signin"
                className="btn-primary inline-flex items-center space-x-2"
              >
                <UserIcon className="h-5 w-5" />
                <span>Sign In</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="bg-gradient-primary flex h-10 w-10 items-center justify-center rounded-xl">
                <BriefcaseIcon className="h-6 w-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-2xl font-bold text-transparent">
                Job Tracker
              </span>
            </Link>
          </div>

          <div className="hidden md:flex md:space-x-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center space-x-2 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-blue-50/80 hover:text-blue-600"
            >
              <DashboardIcon className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/jobs"
              className="inline-flex items-center space-x-2 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-blue-50/80 hover:text-blue-600"
            >
              <BriefcaseIcon className="h-5 w-5" />
              <span>Jobs</span>
            </Link>
            <Link
              href="/upload"
              className="inline-flex items-center space-x-2 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-blue-50/80 hover:text-blue-600"
            >
              <UploadIcon className="h-5 w-5" />
              <span>Upload</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 rounded-xl px-3 py-2 transition-all duration-200 hover:bg-gray-50/80"
              >
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name ?? "User"}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full ring-2 ring-gray-200"
                  />
                ) : (
                  <div className="bg-gradient-primary flex h-10 w-10 items-center justify-center rounded-full">
                    <UserIcon className="h-6 w-6 text-white" />
                  </div>
                )}
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <svg
                  className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-gray-200/50 bg-white/95 py-2 shadow-xl backdrop-blur-lg">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>

                  <div className="py-2 md:hidden">
                    <Link
                      href="/dashboard"
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50/80 hover:text-blue-600"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <DashboardIcon className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href="/jobs"
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50/80 hover:text-blue-600"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <BriefcaseIcon className="h-4 w-4" />
                      <span>Jobs</span>
                    </Link>
                    <Link
                      href="/upload"
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50/80 hover:text-blue-600"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <UploadIcon className="h-4 w-4" />
                      <span>Upload</span>
                    </Link>
                    <div className="mt-2 border-t border-gray-100 pt-2"></div>
                  </div>

                  <button
                    onClick={() => signOut()}
                    className="flex w-full items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50/80"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
