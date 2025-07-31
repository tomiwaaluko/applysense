"use client";

import { useState, useRef } from "react";
import { uploadScreenshot } from "~/lib/upload";

interface FileUploadProps {
  onUploadComplete: (imageUrl: string) => void;
  onUploadError: (error: string) => void;
  jobId: string;
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  onUploadComplete,
  onUploadError,
  jobId,
  disabled = false,
  className = "",
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      onUploadError("Please select an image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      onUploadError("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      const imageUrl = await uploadScreenshot(file, jobId);
      onUploadComplete(imageUrl);
    } catch (error) {
      onUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
        className="hidden"
        id="screenshot-upload"
      />
      <label
        htmlFor="screenshot-upload"
        className={`inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium shadow-sm ${
          disabled || isUploading
            ? "cursor-not-allowed bg-gray-100 text-gray-400"
            : "cursor-pointer bg-white text-gray-700 hover:bg-gray-50"
        } `}
      >
        {isUploading ? (
          <>
            <svg
              className="mr-3 -ml-1 h-4 w-4 animate-spin text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Uploading...
          </>
        ) : (
          <>
            <svg
              className="mr-2 -ml-1 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            Upload Screenshot
          </>
        )}
      </label>
    </div>
  );
}
