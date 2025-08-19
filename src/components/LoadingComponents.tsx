import React from "react";

export const LoadingSpinner: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <div
    className={`inline-block animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] ${className}`}
    role="status"
  >
    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !border-0 !p-0 !whitespace-nowrap ![clip:rect(0,0,0,0)]">
      Loading...
    </span>
  </div>
);

export const PageLoader: React.FC = () => (
  <div className="bg-gradient-hero flex min-h-screen items-center justify-center">
    <div className="text-center">
      <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
      <p className="font-medium text-gray-600">Loading your ApplySense...</p>
    </div>
  </div>
);

export const ButtonLoader: React.FC<{ className?: string }> = ({
  className = "w-5 h-5",
}) => (
  <div
    className={`animate-spin rounded-full border-2 border-white border-t-transparent ${className}`}
  ></div>
);
