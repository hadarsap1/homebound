"use client";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div
      className={`rounded-xl bg-navy-900 border border-navy-800 p-4 ${onClick ? "cursor-pointer active:scale-[0.98] transition-transform" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
