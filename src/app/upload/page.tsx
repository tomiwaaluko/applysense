"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileUpload } from "~/components/FileUpload";
import { api } from "~/trpc/react";
import type { ParsedJobData } from "~/lib/ocr";

export default function UploadPage() {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ParsedJobData | null>(
    null,
  );
  const router = useRouter();

  const extractJobData = api.job.extractFromScreenshot.useMutation();

  const handleUploadComplete = async (imageUrl: string) => {
    setUploadedImageUrl(imageUrl);
    setUploadError(null);

    // Automatically start OCR processing
    setIsProcessing(true);
    try {
      const data = await extractJobData.mutateAsync({ imageUrl });
      setExtractedData(data);
    } catch (error) {
      console.error("OCR extraction failed:", error);
      // Continue anyway - user can still create job manually
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadError = (error: string) => {
    // Provide helpful message for common RLS error
    if (error.includes("row-level security policy") || error.includes("RLS")) {
      setUploadError(
        "Upload blocked by database security. Please check the FIX_UPLOAD_ERROR.md file for setup instructions."
      );
    } else {
      setUploadError(error);
    }
    setUploadedImageUrl(null);
  };

  const handleCreateJob = () => {
    if (uploadedImageUrl) {
      // Create query parameters from extracted data if available
      const params = new URLSearchParams({
        imageUrl: uploadedImageUrl,
        ...(extractedData && {
          company: extractedData.company,
          title: extractedData.title,
          status: extractedData.status,
          date: extractedData.date,
          notes: extractedData.notes ?? "",
        }),
      });

      router.push(`/jobs?${params.toString()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white shadow-lg">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  📸 Screenshot Upload
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Upload a screenshot of your job application and store it
                  securely
                </p>
              </div>
              <Link
                href="/jobs"
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                ← Back to Jobs
              </Link>
            </div>
          </div>

          {/* Upload Section */}
          <div className="p-6">
            <div className="space-y-6">
              {/* Instructions */}
              <div className="rounded-lg bg-blue-50 p-4">
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
                      How to use this tool
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc space-y-1 pl-5">
                        <li>
                          Drag and drop your screenshot or click to browse
                        </li>
                        <li>Supported formats: PNG, JPG, GIF (max 5MB)</li>
                        <li>Your image will be stored securely in Supabase</li>
                        <li>
                          After upload, you can create a job entry with this
                          screenshot
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Component */}
              <FileUpload
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                showPreview={true}
                className="w-full"
              />

              {/* Error Display */}
              {uploadError && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Upload failed
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{uploadError}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Display */}
              {uploadedImageUrl && (
                <div className="rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-green-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-medium text-green-800">
                        Upload successful!
                      </h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>
                          Your screenshot has been uploaded and is ready to use.
                        </p>
                      </div>

                      {/* Processing State */}
                      {isProcessing && (
                        <div className="mt-3 flex items-center text-sm text-blue-700">
                          <svg
                            className="mr-2 h-4 w-4 animate-spin"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          🧠 Analyzing screenshot with AI...
                        </div>
                      )}

                      {/* Extracted Data Display */}
                      {extractedData && !isProcessing && (
                        <div className="mt-3 rounded-md bg-blue-50 p-3">
                          <h4 className="mb-2 text-sm font-medium text-blue-800">
                            🤖 Extracted Information:
                          </h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="font-medium text-blue-700">
                                Company:
                              </span>
                              <p className="text-blue-600">
                                {extractedData.company}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-blue-700">
                                Position:
                              </span>
                              <p className="text-blue-600">
                                {extractedData.title}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-blue-700">
                                Status:
                              </span>
                              <p className="text-blue-600 capitalize">
                                {extractedData.status}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-blue-700">
                                Date:
                              </span>
                              <p className="text-blue-600">
                                {extractedData.date}
                              </p>
                            </div>
                            {extractedData.notes && (
                              <div className="col-span-2">
                                <span className="font-medium text-blue-700">
                                  Notes:
                                </span>
                                <p className="text-xs text-blue-600">
                                  {extractedData.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="mt-4">
                        <button
                          onClick={handleCreateJob}
                          disabled={isProcessing}
                          className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <>
                              <svg
                                className="mr-2 h-4 w-4 animate-spin"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              Processing...
                            </>
                          ) : (
                            <>
                              {extractedData
                                ? "Create Job with Extracted Data"
                                : "Create Job with This Screenshot"}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Features List */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <h4 className="mb-3 text-sm font-medium text-gray-900">
              ✅ Features Implemented
            </h4>
            <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 md:grid-cols-2">
              <div className="flex items-center">
                <svg
                  className="mr-2 h-4 w-4 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Drag & drop interface
              </div>
              <div className="flex items-center">
                <svg
                  className="mr-2 h-4 w-4 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                File validation (type & size)
              </div>
              <div className="flex items-center">
                <svg
                  className="mr-2 h-4 w-4 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Live preview before upload
              </div>
              <div className="flex items-center">
                <svg
                  className="mr-2 h-4 w-4 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Supabase storage integration
              </div>
              <div className="flex items-center">
                <svg
                  className="mr-2 h-4 w-4 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Public URL generation
              </div>
              <div className="flex items-center">
                <svg
                  className="mr-2 h-4 w-4 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Direct job creation flow
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
