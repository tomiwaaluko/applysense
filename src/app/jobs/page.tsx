"use client";

import { useState, useEffect } from "react";
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

export default function JobTracker() {
  const searchParams = useSearchParams();
  const uploadedImageUrl = searchParams.get("imageUrl");

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    company: "",
    title: "",
    status: "Applied",
    date: new Date().toISOString().split("T")[0],
    notes: "",
    imageUrl: "",
  });

  // Auto-open form and set data if coming from upload page
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
    }
  }, [uploadedImageUrl, searchParams]);

  const utils = api.useUtils();
  const { data: jobs, isLoading } = api.job.getAll.useQuery();
  const createJob = api.job.create.useMutation({
    onSuccess: () => {
      void utils.job.getAll.invalidate();
      setShowForm(false);
      setFormData({
        company: "",
        title: "",
        status: "Applied",
        date: new Date().toISOString().split("T")[0],
        notes: "",
        imageUrl: "",
      });
    },
  });
  const deleteJob = api.job.delete.useMutation({
    onSuccess: () => {
      void utils.job.getAll.invalidate();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createJob.mutate({
      ...formData,
      date: new Date(formData.date!),
      imageUrl: formData.imageUrl || undefined,
    });
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
        <h1 className="text-3xl font-bold">Job Tracker</h1>
        <div className="flex gap-3">
          <a
            href="/upload"
            className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
          >
            📸 Upload Screenshot
          </a>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            {showForm ? "Cancel" : "Add Job"}
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
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-lg border bg-gray-50 p-6"
        >
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Company"
              value={formData.company}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, company: e.target.value }))
              }
              className="rounded border p-2"
              required
            />
            <input
              type="text"
              placeholder="Job Title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="rounded border p-2"
              required
            />
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, status: e.target.value }))
              }
              className="rounded border p-2"
            >
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, date: e.target.value }))
              }
              className="rounded border p-2"
              required
            />
          </div>
          <textarea
            placeholder="Notes"
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
            className="mt-4 w-full rounded border p-2"
            rows={3}
          />

          <div className="mt-4">
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
                  className="ml-2 text-sm text-red-500"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={createJob.isPending}
            className="mt-4 rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:bg-gray-300"
          >
            {createJob.isPending ? "Adding..." : "Add Job"}
          </button>
        </form>
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
