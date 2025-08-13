"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { api } from "~/trpc/react";
import { deleteScreenshot } from "~/lib/upload";
import { NotificationReminders } from "~/components/NotificationReminders";
import {
  DashboardIcon,
  BriefcaseIcon,
  PhotoIcon,
  TrendingUpIcon,
  SparkleIcon,
  PlusIcon,
} from "~/components/icons";

type Job = {
  id: string;
  company: string;
  title: string;
  status: string;
  date: Date;
  notes: string | null;
  imageUrl: string | null;
  userId: string;
  createdAt: Date;
};

type ViewMode = "cards" | "table";
type SortBy = "date" | "company" | "title" | "status";
type SortOrder = "asc" | "desc";

export default function Dashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: jobs, isLoading } = api.job.getAll.useQuery();
  const deleteJob = api.job.delete.useMutation({
    onSuccess: () => {
      void utils.job.getAll.invalidate();
    },
  });
  const utils = api.useUtils();

  // Filter and sort jobs
  const filteredAndSortedJobs = useMemo(() => {
    if (!jobs) return [];

    let filtered = jobs;

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (job) => job.status.toLowerCase() === filterStatus.toLowerCase(),
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.notes?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Sort jobs
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "company":
          comparison = a.company.localeCompare(b.company);
          break;
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [jobs, filterStatus, searchTerm, sortBy, sortOrder]);

  // Get status counts and advanced statistics
  const statusCounts = useMemo(() => {
    if (!jobs) return {};
    return jobs.reduce(
      (acc, job) => {
        const status = job.status.toLowerCase();
        acc[status] = (acc[status] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [jobs]);

  // Calculate advanced statistics
  const advancedStats = useMemo(() => {
    if (!jobs || jobs.length === 0) {
      return {
        totalApplications: 0,
        interviewRate: 0,
        offerRate: 0,
        responseRate: 0,
        avgResponseTime: 0,
        recentActivity: 0,
      };
    }

    const total = jobs.length;
    const interviews = statusCounts.interview ?? 0;
    const offers = statusCounts.offer ?? 0;
    const rejected = statusCounts.rejected ?? 0;
    const responded = interviews + offers + rejected;

    // Calculate recent activity (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentJobs = jobs.filter(
      (job) => new Date(job.createdAt) >= oneWeekAgo,
    );

    return {
      totalApplications: total,
      interviewRate: total > 0 ? Math.round((interviews / total) * 100) : 0,
      offerRate: total > 0 ? Math.round((offers / total) * 100) : 0,
      responseRate: total > 0 ? Math.round((responded / total) * 100) : 0,
      avgResponseTime: 0, // Could be calculated based on date differences
      recentActivity: recentJobs.length,
    };
  }, [jobs, statusCounts]);

  const handleDelete = async (job: Job) => {
    if (
      !confirm(`Are you sure you want to delete the job at ${job.company}?`)
    ) {
      return;
    }

    if (job.imageUrl) {
      try {
        await deleteScreenshot(job.imageUrl);
      } catch (error) {
        console.warn("Failed to delete screenshot:", error);
      }
    }
    deleteJob.mutate({ id: job.id });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "applied":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "interview":
        return "bg-yellow-50 text-yellow-700 border border-yellow-200";
      case "offer":
        return "bg-green-50 text-green-700 border border-green-200";
      case "rejected":
        return "bg-red-50 text-red-700 border border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "applied":
        return <BriefcaseIcon className="h-3 w-3" />;
      case "interview":
        return <SparkleIcon className="h-3 w-3" />;
      case "offer":
        return <TrendingUpIcon className="h-3 w-3" />;
      case "rejected":
        return "❌";
      default:
        return <DashboardIcon className="h-3 w-3" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-hero flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="font-medium text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-hero min-h-screen">
      {/* Header */}
      <div className="glass-card sticky top-20 z-40 border-b border-gray-200/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-8">
            <div className="animate-slide-in-left">
              <div className="mb-2 flex items-center space-x-4">
                <div className="bg-gradient-primary flex h-12 w-12 items-center justify-center rounded-2xl">
                  <DashboardIcon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Job Dashboard
                  </h1>
                  <p className="text-gray-600">
                    Track your applications and opportunities
                  </p>
                </div>
              </div>
            </div>
            <div className="animate-slide-in-right flex items-center gap-4">
              <NotificationReminders />
              <Link
                href="/upload"
                className="btn-accent group inline-flex items-center space-x-2"
              >
                <PhotoIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                <span className="hidden sm:inline">Upload Screenshot</span>
                <span className="sm:hidden">Upload</span>
              </Link>
              <Link
                href="/jobs"
                className="btn-secondary group inline-flex items-center space-x-2"
              >
                <PlusIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                <span className="hidden sm:inline">Add Manually</span>
                <span className="sm:hidden">Add</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="animate-fade-in-up mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="feature-card p-6">
            <div className="flex items-center">
              <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600">
                <DashboardIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {jobs?.length ?? 0}
                </p>
              </div>
            </div>
          </div>

          <div className="feature-card p-6">
            <div className="flex items-center">
              <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600">
                <SparkleIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Interviews</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statusCounts.interview ?? 0}
                </p>
              </div>
            </div>
          </div>

          <div className="feature-card p-6">
            <div className="flex items-center">
              <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600">
                <TrendingUpIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Offers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statusCounts.offer ?? 0}
                </p>
              </div>
            </div>
          </div>

          <div className="feature-card p-6">
            <div className="flex items-center">
              <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600">
                <BriefcaseIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Applied</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statusCounts.applied ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Statistics */}
        <div
          className="feature-card animate-fade-in-up mb-8 p-8"
          style={{ animationDelay: "0.2s" }}
        >
          <h3 className="mb-6 flex items-center text-xl font-bold text-gray-900">
            <TrendingUpIcon className="mr-3 h-6 w-6 text-blue-600" />
            Success Metrics
          </h3>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-5">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600">
                <span className="text-2xl font-bold text-white">
                  {advancedStats.interviewRate}%
                </span>
              </div>
              <p className="text-sm font-medium text-gray-600">
                Interview Rate
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600">
                <span className="text-2xl font-bold text-white">
                  {advancedStats.offerRate}%
                </span>
              </div>
              <p className="text-sm font-medium text-gray-600">Offer Rate</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600">
                <span className="text-2xl font-bold text-white">
                  {advancedStats.responseRate}%
                </span>
              </div>
              <p className="text-sm font-medium text-gray-600">Response Rate</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600">
                <span className="text-2xl font-bold text-white">
                  {advancedStats.recentActivity}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-500 to-gray-600">
                <span className="text-2xl font-bold text-white">
                  {advancedStats.totalApplications}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-600">Total Apps</p>
            </div>
          </div>
        </div>

        {/* Quick Filters for Mobile */}
        <div className="mb-4 block md:hidden">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                filterStatus === "all"
                  ? "border border-blue-200 bg-blue-100 text-blue-800"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              All ({jobs?.length ?? 0})
            </button>
            {Object.entries(statusCounts).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`flex items-center space-x-1 rounded-full px-4 py-2 text-sm font-medium capitalize transition-all duration-200 ${
                  filterStatus === status
                    ? getStatusColor(status)
                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span>{getStatusIcon(status)}</span>
                <span>
                  {status} ({count})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div
          className="feature-card animate-fade-in-up mb-8 p-6"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="max-w-md flex-1">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full rounded-2xl border border-gray-200 bg-white py-3 pr-4 pl-12 text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Status Filter */}
              <div className="hidden items-center gap-3 md:flex">
                <span className="text-sm font-semibold text-gray-700">
                  Filter:
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterStatus("all")}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      filterStatus === "all"
                        ? "border border-blue-200 bg-blue-100 text-blue-800"
                        : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    All ({jobs?.length ?? 0})
                  </button>
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`flex items-center space-x-1 rounded-full px-4 py-2 text-sm font-medium capitalize transition-all duration-200 ${
                        filterStatus === status
                          ? getStatusColor(status)
                          : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span>{getStatusIcon(status)}</span>
                      <span>
                        {status} ({count})
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-700">
                  Sort:
                </span>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split(
                      "-",
                    ) as [SortBy, SortOrder];
                    setSortBy(newSortBy);
                    setSortOrder(newSortOrder);
                  }}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="company-asc">Company A-Z</option>
                  <option value="company-desc">Company Z-A</option>
                  <option value="title-asc">Title A-Z</option>
                  <option value="title-desc">Title Z-A</option>
                  <option value="status-asc">Status A-Z</option>
                  <option value="status-desc">Status Z-A</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-700">
                  View:
                </span>
                <div className="flex rounded-xl border border-gray-200 bg-white p-1">
                  <button
                    onClick={() => setViewMode("cards")}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      viewMode === "cards"
                        ? "bg-blue-100 text-blue-700 shadow-sm"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                    }`}
                  >
                    Cards
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      viewMode === "table"
                        ? "bg-blue-100 text-blue-700 shadow-sm"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                    }`}
                  >
                    Table
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results count */}
        {searchTerm || filterStatus !== "all" ? (
          <div className="mb-6">
            <div className="glass-card rounded-xl p-4">
              <p className="text-sm font-medium text-gray-700">
                Showing{" "}
                <span className="font-bold text-blue-600">
                  {filteredAndSortedJobs.length}
                </span>{" "}
                of <span className="font-bold">{jobs?.length ?? 0}</span> jobs
                {searchTerm && (
                  <span className="text-gray-500">
                    {" "}
                    matching &ldquo;
                    <span className="font-medium">{searchTerm}</span>&rdquo;
                  </span>
                )}
                {filterStatus !== "all" && (
                  <span className="text-gray-500">
                    {" "}
                    with status &ldquo;
                    <span className="font-medium capitalize">
                      {filterStatus}
                    </span>
                    &rdquo;
                  </span>
                )}
              </p>
            </div>
          </div>
        ) : null}

        {/* Content */}
        {filteredAndSortedJobs.length === 0 ? (
          <div className="animate-fade-in-up py-16 text-center">
            <div className="feature-card mx-auto max-w-md p-12">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-400 to-gray-500">
                <BriefcaseIcon className="h-10 w-10 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">
                No jobs found
              </h3>
              <p className="mb-8 leading-relaxed text-gray-600">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria to find what you're looking for."
                  : "Get started by uploading a job screenshot or adding a job manually to begin tracking your applications."}
              </p>
              <div className="space-y-3">
                <Link
                  href="/upload"
                  className="btn-primary group inline-flex w-full items-center justify-center space-x-2"
                >
                  <PhotoIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                  <span>Upload Screenshot</span>
                </Link>
                <Link
                  href="/jobs"
                  className="btn-secondary group inline-flex w-full items-center justify-center space-x-2"
                >
                  <PlusIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                  <span>Add Job Manually</span>
                </Link>
              </div>
            </div>
          </div>
        ) : viewMode === "cards" ? (
          /* Card View */
          <div className="animate-fade-in-up grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedJobs.map((job, index) => (
              <div
                key={job.id}
                className="feature-card group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-6 flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-2 text-xl font-bold text-gray-900 transition-colors duration-200 group-hover:text-blue-600">
                      {job.title}
                    </h3>
                    <p className="mb-3 text-lg font-semibold text-gray-700">
                      {job.company}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center space-x-1 rounded-full px-3 py-1 text-sm font-medium transition-all duration-200 ${getStatusColor(job.status)}`}
                  >
                    <span>{getStatusIcon(job.status)}</span>
                    <span className="capitalize">{job.status}</span>
                  </span>
                </div>

                {job.imageUrl && (
                  <div className="mb-6">
                    <Image
                      src={job.imageUrl}
                      alt={`Screenshot for ${job.company} ${job.title}`}
                      width={300}
                      height={200}
                      className="h-40 w-full rounded-xl border border-gray-200 object-cover transition-all duration-300 group-hover:shadow-md"
                    />
                  </div>
                )}

                <div className="mb-6 space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg
                      className="mr-3 h-5 w-5 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="font-medium">{formatDate(job.date)}</span>
                  </div>
                  {job.notes && (
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="line-clamp-3 text-sm leading-relaxed text-gray-700">
                        {job.notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-xs font-medium text-gray-500">
                    Added {formatDate(job.createdAt)}
                  </span>
                  <div className="flex gap-3">
                    <Link
                      href={`/jobs?edit=${job.id}`}
                      className="text-sm font-semibold text-blue-600 transition-colors duration-200 hover:text-blue-700"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(job)}
                      className="text-sm font-semibold text-red-600 transition-colors duration-200 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="feature-card animate-fade-in-up overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-700 uppercase">
                      Job Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-700 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-700 uppercase">
                      Date Applied
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-700 uppercase">
                      Screenshot
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-700 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredAndSortedJobs.map((job, index) => (
                    <tr
                      key={job.id}
                      className="transition-colors duration-200 hover:bg-blue-50/50"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="px-6 py-6">
                        <div className="max-w-sm">
                          <div className="mb-1 text-lg font-bold text-gray-900">
                            {job.title}
                          </div>
                          <div className="mb-2 text-base font-semibold text-gray-700">
                            {job.company}
                          </div>
                          {job.notes && (
                            <div className="mt-2 rounded-lg bg-gray-50 p-2 text-sm text-gray-600">
                              <p className="line-clamp-2">{job.notes}</p>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span
                          className={`inline-flex items-center space-x-1 rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(job.status)}`}
                        >
                          <span>{getStatusIcon(job.status)}</span>
                          <span className="capitalize">{job.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-6 text-sm font-medium text-gray-900">
                        {formatDate(job.date)}
                      </td>
                      <td className="px-6 py-6">
                        {job.imageUrl ? (
                          <Image
                            src={job.imageUrl}
                            alt={`Screenshot for ${job.company}`}
                            width={80}
                            height={60}
                            className="h-16 w-20 rounded-lg border border-gray-200 object-cover shadow-sm transition-shadow duration-200 hover:shadow-md"
                          />
                        ) : (
                          <div className="flex h-16 w-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
                            <span className="text-xs font-medium text-gray-400">
                              No image
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex gap-4">
                          <Link
                            href={`/jobs?edit=${job.id}`}
                            className="text-sm font-semibold text-blue-600 transition-colors duration-200 hover:text-blue-700"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(job)}
                            className="text-sm font-semibold text-red-600 transition-colors duration-200 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
