"use client";

import { useState } from "react";
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
  const [showForm, setShowForm] = useState(false);
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
      utils.job.getAll.invalidate();
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
      utils.job.getAll.invalidate();
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
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          {showForm ? "Cancel" : "Add Job"}
        </button>
      </div>

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
              jobId={crypto.randomUUID()}
              className="mb-4"
            />
            {formData.imageUrl && (
              <div className="mt-2">
                <img
                  src={formData.imageUrl}
                  alt="Screenshot preview"
                  className="h-auto max-w-xs rounded border"
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
                    <img
                      src={job.imageUrl}
                      alt="Job screenshot"
                      className="h-auto max-w-md cursor-pointer rounded border"
                      onClick={() => window.open(job.imageUrl!, "_blank")}
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
