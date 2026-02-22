"use client";

type AvatarSize = "sm" | "md" | "lg";

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

interface AvatarProps {
  name: string;
  size?: AvatarSize;
  className?: string;
}

export function Avatar({ name, size = "md", className = "" }: AvatarProps) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-navy-700 text-amber-400 font-semibold ${sizeClasses[size]} ${className}`}
      aria-label={name}
    >
      {initial}
    </div>
  );
}
