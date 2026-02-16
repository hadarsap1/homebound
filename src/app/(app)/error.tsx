"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <AlertTriangle size={40} className="text-rose-400 mb-4" />
      <h2 className="text-lg font-bold text-navy-300">Something went wrong</h2>
      <p className="text-sm text-navy-500 mt-1 mb-4">
        An unexpected error occurred. Please try again.
      </p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}
