"use client";

import { forwardRef } from "react";

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = "", id, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <label
        htmlFor={checkboxId}
        className="flex items-center gap-3 min-h-[44px] cursor-pointer"
      >
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          className={`
            h-5 w-5 rounded border-navy-700 bg-navy-800
            text-amber-500 focus:ring-amber-500 focus:ring-offset-0
            focus:ring-1 cursor-pointer
            ${className}
          `}
          {...props}
        />
        {label && (
          <span className="text-sm text-navy-300 select-none">{label}</span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
