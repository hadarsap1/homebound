"use client";

import { forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-amber-500 text-navy-950 hover:bg-amber-400 font-semibold",
  secondary: "bg-navy-800 text-navy-300 hover:bg-navy-700 border border-navy-700",
  ghost: "text-navy-400 hover:text-navy-300 hover:bg-navy-800",
  danger: "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", fullWidth, className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center rounded-lg px-4 py-3
          transition-colors disabled:opacity-50 disabled:cursor-not-allowed
          ${variants[variant]}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
