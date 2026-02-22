"use client";

import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-navy-400 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`
            block w-full rounded-lg border bg-navy-900 px-4 py-3
            text-navy-300 placeholder-navy-600
            focus:outline-none focus:ring-1
            ${error
              ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
              : "border-navy-700 focus:border-amber-500 focus:ring-amber-500"
            }
            ${className}
          `}
          {...props}
        />
        {error && <p id={`${inputId}-error`} className="mt-1 text-sm text-rose-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
