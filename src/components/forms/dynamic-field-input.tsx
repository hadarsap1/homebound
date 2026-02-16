"use client";

import type { CustomFieldDefinition, Json } from "@/lib/supabase/types";
import { Input } from "@/components/ui/input";

interface DynamicFieldInputProps {
  definition: CustomFieldDefinition;
  value: Json | undefined;
  onChange: (value: Json) => void;
}

export function DynamicFieldInput({ definition, value, onChange }: DynamicFieldInputProps) {
  switch (definition.type) {
    case "text":
      return (
        <Input
          label={definition.label}
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${definition.label.toLowerCase()}`}
        />
      );

    case "number":
      return (
        <Input
          label={definition.label}
          type="number"
          value={(value as number) ?? ""}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")}
          placeholder={`Enter ${definition.label.toLowerCase()}`}
        />
      );

    case "boolean":
      return (
        <label className="flex items-center gap-3 py-2">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            className="h-5 w-5 rounded border-navy-700 bg-navy-900 text-amber-500 focus:ring-amber-500"
          />
          <span className="text-sm text-navy-400">{definition.label}</span>
        </label>
      );

    case "select":
      return (
        <div>
          <label className="block text-sm font-medium text-navy-400 mb-1">
            {definition.label}
          </label>
          <select
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            className="block w-full rounded-lg border border-navy-700 bg-navy-900 px-4 py-3 text-navy-300 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="">Select...</option>
            {definition.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );

    default:
      return null;
  }
}
