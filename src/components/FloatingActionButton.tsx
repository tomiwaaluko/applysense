"use client";

import Link from "next/link";
import { useState } from "react";
import { PlusIcon, PhotoIcon, BriefcaseIcon } from "./icons";

export const FloatingActionButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed right-8 bottom-8 z-50">
      {/* Action Menu */}
      {isOpen && (
        <div className="animate-fade-in-up absolute right-0 bottom-16 space-y-3">
          <Link
            href="/upload"
            className="flex transform items-center space-x-3 rounded-full border border-gray-200 bg-white px-4 py-3 shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
            onClick={() => setIsOpen(false)}
          >
            <PhotoIcon className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium whitespace-nowrap text-gray-700">
              Upload Screenshot
            </span>
          </Link>
          <Link
            href="/jobs"
            className="flex transform items-center space-x-3 rounded-full border border-gray-200 bg-white px-4 py-3 shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
            onClick={() => setIsOpen(false)}
          >
            <BriefcaseIcon className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium whitespace-nowrap text-gray-700">
              Add Job Manually
            </span>
          </Link>
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-gradient-primary flex h-14 w-14 transform items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl ${
          isOpen ? "rotate-45" : ""
        }`}
      >
        <PlusIcon className="h-6 w-6 text-white" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 -z-10" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};
