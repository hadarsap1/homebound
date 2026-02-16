"use client";

import type { PropertyStatus } from "@/lib/supabase/types";
import type { ReactNode } from "react";

const statusColors: Record<PropertyStatus, string> = {
  new: "bg-cyan-500/10 text-cyan-400",
  visited: "bg-amber-500/10 text-amber-400",
  interested: "bg-emerald-500/10 text-emerald-400",
  offer_made: "bg-purple-500/10 text-purple-400",
  rejected: "bg-rose-500/10 text-rose-400",
  archived: "bg-navy-700/50 text-navy-500",
};

const statusLabels: Record<PropertyStatus, string> = {
  new: "New",
  visited: "Visited",
  interested: "Interested",
  offer_made: "Offer Made",
  rejected: "Rejected",
  archived: "Archived",
};

export interface BadgeProps {
  status?: PropertyStatus;
  label?: string;
  children?: ReactNode;
  className?: string;
  variant?: "status" | "tag" | "default" | "outline";
}

export function Badge({ status, label, children, className = "", variant = "status" }: BadgeProps) {
  const content = children || label;

  if (variant === "tag") {
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-navy-800 text-navy-400 ${className}`}>
        {content}
      </span>
    );
  }

  if (variant === "default") {
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-500 text-navy-950 ${className}`}>
        {content}
      </span>
    );
  }

  if (variant === "outline") {
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border border-navy-700 text-navy-400 ${className}`}>
        {content}
      </span>
    );
  }

  const colorClass = status ? statusColors[status] : "bg-navy-800 text-navy-400";
  const text = content || (status ? statusLabels[status] : "");

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass} ${className}`}>
      {text}
    </span>
  );
}
