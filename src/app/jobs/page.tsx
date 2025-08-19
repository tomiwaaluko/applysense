"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { api } from "~/trpc/react";
import { FileUpload } from "~/components/FileUpload";
import { deleteScreenshot } from "~/lib/upload";

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

type JobTemplate = {
  id: string;
  name: string;
  title: string;
  status: string;
  notes: string;
};

const JOB_TEMPLATES: JobTemplate[] = [
  {
    id: "swe",
    name: "Software Engineer",
    title: "Software Engineer",
    status: "Applied",
    notes: "Full-stack development role with React and Node.js",
  },
  {
    id: "fe",
    name: "Frontend Developer",
    title: "Frontend Developer",
    status: "Applied",
    notes: "Frontend development with React, TypeScript, and modern CSS",
  },
  {
    id: "be",
    name: "Backend Developer",
    title: "Backend Developer",
    status: "Applied",
    notes: "Backend development with Node.js, Python, or Java",
  },
  {
    id: "fs",
    name: "Full Stack Developer",
    title: "Full Stack Developer",
    status: "Applied",
    notes: "End-to-end development with modern tech stack",
  },
  {
    id: "pm",
    name: "Product Manager",
    title: "Product Manager",
    status: "Applied",
    notes:
      "Product strategy, roadmap planning, and cross-functional collaboration",
  },
  {
    id: "ds",
    name: "Data Scientist",
    title: "Data Scientist",
    status: "Applied",
    notes: "Machine learning, data analysis, and statistical modeling",
  },
];

export default function JobTracker() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <JobTrackerContent />
    </Suspense>
  );
}

function JobTrackerContent() {
  const searchParams = useSearchParams();
  const uploadedImageUrl = searchParams.get("imageUrl");
  const editJobId = searchParams.get("edit");

  const [showForm, setShowForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [formData, setFormData] = useState({
    company: "",
    title: "",
    status: "Applied",
    date: new Date().toISOString().split("T")[0],
    notes: "",
    imageUrl: "",
  });

  const utils = api.useUtils();
  const { data: jobs, isLoading } = api.job.getAll.useQuery();
  const createJob = api.job.create.useMutation({
    onSuccess: () => {
      void utils.job.getAll.invalidate();
      setShowForm(false);
      resetForm();
    },
  });
  const updateJob = api.job.update.useMutation({
    onSuccess: () => {
      void utils.job.getAll.invalidate();
      setShowForm(false);
      resetForm();
    },
  });
  const deleteJob = api.job.delete.useMutation({
    onSuccess: () => {
      void utils.job.getAll.invalidate();
    },
  });

  const isEditing = !!editJobId;

  const resetForm = () => {
    setFormData({
      company: "",
      title: "",
      status: "Applied",
      date: new Date().toISOString().split("T")[0],
      notes: "",
      imageUrl: "",
    });
    setSelectedTemplate("");
  };

  // Auto-open form and set data if coming from upload page or editing
  useEffect(() => {
    if (uploadedImageUrl) {
      const newFormData = {
        company: searchParams.get("company") ?? "",
        title: searchParams.get("title") ?? "",
        status: searchParams.get("status") ?? "Applied",
        date:
          searchParams.get("date") ?? new Date().toISOString().split("T")[0],
        notes: searchParams.get("notes") ?? "",
        imageUrl: decodeURIComponent(uploadedImageUrl),
      };

      setFormData(newFormData);
      setShowForm(true);
    } else if (editJobId && jobs) {
      const jobToEdit = jobs.find((job) => job.id === editJobId);
      if (jobToEdit) {
        setFormData({
          company: jobToEdit.company,
          title: jobToEdit.title,
          status: jobToEdit.status,
          date: new Date(jobToEdit.date).toISOString().split("T")[0],
          notes: jobToEdit.notes ?? "",
          imageUrl: jobToEdit.imageUrl ?? "",
        });
        setShowForm(true);
      }
    }
  }, [uploadedImageUrl, searchParams, editJobId, jobs]);

  const handleTemplateSelect = (templateId: string) => {
    const template = JOB_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setFormData((prev) => ({
        ...prev,
        title: template.title,
        status: template.status,
        notes: template.notes,
      }));
      setSelectedTemplate(templateId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing) {
      updateJob.mutate({
        id: editJobId,
        ...formData,
        date: new Date(formData.date!),
        imageUrl: formData.imageUrl || undefined,
      });
    } else {
      createJob.mutate({
        ...formData,
        date: new Date(formData.date!),
        imageUrl: formData.imageUrl || undefined,
      });
    }
  };

  const handleDelete = async (job: Job) => {
    if (job.imageUrl) {
      try {
        await deleteScreenshot(job.imageUrl);
      } catch (error) {
        console.warn("Failed to delete screenshot:", error);
      }
    }
    deleteJob.mutate({ id: job.id });
  };

  const handleUploadComplete = (imageUrl: string) => {
    setFormData((prev) => ({ ...prev, imageUrl }));
  };

  const handleUploadError = (error: string) => {
    alert(`Upload error: ${error}`);
  };

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="mx-auto max-w-6xl p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">ApplySense</h1>
        <div className="flex gap-3">
          <a
            href="/dashboard"
            className="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
          >
            📊 Dashboard
          </a>
          <a
            href="/upload"
            className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
          >
            📸 Upload Screenshot
          </a>
          <button
            onClick={() => {
              setShowForm(!showForm);
              if (!showForm) resetForm();
            }}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            {showForm ? "Cancel" : isEditing ? "Edit Job" : "Add Job"}
          </button>
        </div>
      </div>

      {/* AI Extraction Banner */}
      {uploadedImageUrl && searchParams.get("company") && showForm && (
        <div className="mb-6 rounded-md border border-blue-200 bg-blue-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                🤖 Form Auto-Populated from AI
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  I&apos;ve automatically filled out the form based on your
                  screenshot. Please review and edit as needed before saving.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="mb-8 space-y-6">
          {/* Job Templates */}
          {!isEditing && !uploadedImageUrl && (
            <div className="rounded-lg border bg-white p-6">
              <h3 className="mb-4 text-lg font-medium text-gray-900">
                Quick Start Templates
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                Choose a template to pre-fill common job details, or create from
                scratch.
              </p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {JOB_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => {
                      handleTemplateSelect(template.id);
                      setSelectedTemplate(template.id);
                    }}
                    className={`rounded-lg border p-4 text-left transition-colors hover:border-blue-300 hover:bg-blue-50 ${
                      selectedTemplate === template.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <h4 className="font-medium text-gray-900">
                      {template.name}
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      {template.notes}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="rounded-lg border bg-white p-6"
          >
            <h3 className="mb-4 text-lg font-medium text-gray-900">
              {isEditing ? "Edit Job Application" : "Add New Job Application"}
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Company *
                </label>
                <input
                  type="text"
                  placeholder="Company Name"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      company: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Job Title *
                </label>
                <input
                  type="text"
                  placeholder="Position Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="Applied">📝 Applied</option>
                  <option value="Interview">🎯 Interview</option>
                  <option value="Offer">🎉 Offer</option>
                  <option value="Rejected">❌ Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Application Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                placeholder="Add notes about the position, requirements, interview details, etc."
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Screenshot (Optional)
              </label>
              <FileUpload
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                className="mb-4"
                showPreview={false}
              />
              {formData.imageUrl && (
                <div className="mt-2">
                  <Image
                    src={formData.imageUrl}
                    alt="Screenshot preview"
                    width={320}
                    height={240}
                    className="h-auto max-w-xs rounded border object-contain"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, imageUrl: "" }))
                    }
                    className="ml-2 text-sm text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={createJob.isPending || updateJob.isPending}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:bg-gray-300"
              >
                {createJob.isPending || updateJob.isPending
                  ? isEditing
                    ? "Updating..."
                    : "Adding..."
                  : isEditing
                    ? "Update Job"
                    : "Add Job"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {jobs?.map((job: Job) => (
          <div key={job.id} className="rounded-lg border bg-white p-4 shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{job.title}</h3>
                <p className="text-gray-600">{job.company}</p>
                <p className="text-sm text-gray-500">
                  Status: <span className="font-medium">{job.status}</span> |
                  Date: {new Date(job.date).toLocaleDateString()}
                </p>
                {job.notes && <p className="mt-2 text-gray-700">{job.notes}</p>}
                {job.imageUrl && (
                  <div className="mt-3">
                    <Image
                      src={job.imageUrl}
                      alt="Job screenshot"
                      width={400}
                      height={300}
                      className="h-auto max-w-md cursor-pointer rounded border object-contain"
                      onClick={() => window.open(job.imageUrl!, "_blank")}
                      unoptimized
                    />
                  </div>
                )}
              </div>
              <button
                onClick={() => handleDelete(job)}
                disabled={deleteJob.isPending}
                className="ml-4 text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
