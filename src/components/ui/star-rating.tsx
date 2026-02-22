"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  label?: string;
  readOnly?: boolean;
}

export function StarRating({ value, onChange, size = 24, label, readOnly }: StarRatingProps) {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-sm text-navy-400 w-24">{label}</span>}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(star)}
            aria-label={`Rate ${star} of 5`}
            className={`p-1.5 ${readOnly ? "cursor-default" : "cursor-pointer"} transition-colors`}
          >
            <Star
              size={size}
              aria-hidden="true"
              className={
                star <= value
                  ? "fill-amber-400 text-amber-400"
                  : "fill-none text-navy-600"
              }
            />
          </button>
        ))}
      </div>
      <span className="text-sm text-navy-500 ml-1">{value}/5</span>
    </div>
  );
}
