"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function PropertiesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Properties page error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <AlertCircle size={40} className="text-rose-400 mb-3" />
      <h2 className="text-lg font-bold text-navy-300">Something went wrong</h2>
      <p className="text-sm text-navy-500 mt-1 mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-navy-950"
      >
        Try Again
      </button>
    </div>
  );
}
