"use client";

import { Home } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4 text-navy-600">
        {icon || <Home size={48} />}
      </div>
      <h3 className="text-lg font-semibold text-navy-400">{title}</h3>
      <p className="mt-1 text-sm text-navy-500 max-w-xs">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
