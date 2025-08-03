"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { uploadScreenshot } from "~/lib/upload";

interface FileUploadProps {
  onUploadComplete: (imageUrl: string) => void;
  onUploadError: (error: string) => void;
  jobId?: string;
  disabled?: boolean;
  className?: string;
  showPreview?: boolean;
}

export function FileUpload({
  onUploadComplete,
  onUploadError,
  jobId,
  disabled = false,
  className = "",
  showPreview = true,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): boolean => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        onUploadError("Please select an image file");
        return false;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        onUploadError("File size must be less than 5MB");
        return false;
      }

      return true;
    },
    [onUploadError],
  );

  const handleFile = useCallback(
    async (file: File) => {
      if (!validateFile(file)) return;

      // Create preview
      if (showPreview) {
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);
      }

      setIsUploading(true);

      try {
        const tempJobId = jobId ?? `temp-${Date.now()}`;
        const imageUrl = await uploadScreenshot(file, tempJobId);
        onUploadComplete(imageUrl);
      } catch (error) {
        onUploadError(error instanceof Error ? error.message : "Upload failed");
        setPreview(null);
      } finally {
        setIsUploading(false);
      }
    },
    [validateFile, showPreview, jobId, onUploadComplete, onUploadError],
  );

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await handleFile(file);

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (!disabled && !isUploading) {
        setIsDragOver(true);
      }
    },
    [disabled, isUploading],
  );

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragOver(false);

      if (disabled || isUploading) return;

      const files = Array.from(event.dataTransfer.files);
      const file = files[0];

      if (file) {
        await handleFile(file);
      }
    },
    [disabled, isUploading, handleFile],
  );

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
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

      {/* Main upload area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`relative cursor-pointer rounded-lg border-2 border-dashed p-6 transition-colors ${
          isDragOver
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        } ${
          disabled || isUploading
            ? "cursor-not-allowed bg-gray-50"
            : "hover:bg-gray-50"
        }`}
      >
        <div className="text-center">
          {isUploading ? (
            <div className="space-y-2">
              <svg
                className="mx-auto h-12 w-12 animate-spin text-gray-400"
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
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="screenshot-upload"
                  className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 focus-within:outline-none hover:text-blue-500"
                >
                  <span>Upload a screenshot</span>
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      {showPreview && preview && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-gray-700">Preview:</p>
          <div className="relative">
            <Image
              src={preview}
              alt="Upload preview"
              width={160}
              height={160}
              className="max-h-40 w-auto rounded-lg border object-contain"
              unoptimized
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPreview(null);
                URL.revokeObjectURL(preview);
              }}
              className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
