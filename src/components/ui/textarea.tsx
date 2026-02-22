"use client";

import { forwardRef } from "react";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-navy-400 mb-1"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          className={`
            block w-full rounded-lg border bg-navy-900 px-4 py-3
            text-navy-300 placeholder-navy-600 resize-y min-h-[80px]
            focus:outline-none focus:ring-1
            ${
              error
                ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                : "border-navy-700 focus:border-amber-500 focus:ring-amber-500"
            }
            ${className}
          `}
          {...props}
        />
        {error && <p id={`${textareaId}-error`} className="mt-1 text-sm text-rose-400">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
