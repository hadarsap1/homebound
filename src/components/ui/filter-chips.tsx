"use client";

interface FilterChipOption {
  value: string;
  label: string;
}

interface FilterChipsProps {
  options: FilterChipOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function FilterChips({
  options,
  value,
  onChange,
  className = "",
}: FilterChipsProps) {
  return (
    <div
      className={`flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar ${className}`}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-colors min-h-[44px] ${
            value === opt.value
              ? "bg-amber-500/20 text-amber-400"
              : "bg-navy-800 text-navy-500"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
