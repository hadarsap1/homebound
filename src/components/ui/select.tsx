"use client";

import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = "", id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-navy-400 mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${selectId}-error` : undefined}
            className={`
              block w-full appearance-none rounded-lg border bg-navy-900 px-4 py-3 pr-10
              text-navy-300
              focus:outline-none focus:ring-1
              ${
                error
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                  : "border-navy-700 focus:border-amber-500 focus:ring-amber-500"
              }
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-500" />
        </div>
        {error && <p id={`${selectId}-error`} className="mt-1 text-sm text-rose-400">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
