"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { CustomFieldDefinition } from "@/lib/supabase/types";
import { Plus, X } from "lucide-react";

interface CustomFieldCreatorProps {
  entity?: "property" | "rating" | "checklist";
  onAdd: (field: CustomFieldDefinition) => void;
  onCancel?: () => void;
}

export function CustomFieldCreator({ entity = "property", onAdd, onCancel }: CustomFieldCreatorProps) {
  const [label, setLabel] = useState("");
  const [type, setType] = useState<CustomFieldDefinition["type"]>("text");
  const [options, setOptions] = useState<string[]>([""]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;

    const key = label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    const field: CustomFieldDefinition = {
      key,
      label: label.trim(),
      type,
      entity,
      ...(type === "select" ? { options: options.filter((o) => o.trim()) } : {}),
    };
    onAdd(field);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-navy-700 bg-navy-800/50 p-3 space-y-3">
      <Input
        label="Field Name"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="e.g. School District"
        required
      />

      <div>
        <label className="block text-sm font-medium text-navy-400 mb-1">Field Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as CustomFieldDefinition["type"])}
          className="block w-full rounded-lg border border-navy-700 bg-navy-900 px-4 py-3 text-navy-300 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        >
          <option value="text">Text</option>
          <option value="number">Number</option>
          <option value="boolean">Yes/No</option>
          <option value="select">Dropdown</option>
        </select>
      </div>

      {type === "select" && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-navy-400">Options</label>
          {options.map((opt, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={opt}
                onChange={(e) => {
                  const next = [...options];
                  next[i] = e.target.value;
                  setOptions(next);
                }}
                placeholder={`Option ${i + 1}`}
              />
              {options.length > 1 && (
                <button
                  type="button"
                  onClick={() => setOptions(options.filter((_, j) => j !== i))}
                  className="text-navy-500 hover:text-rose-400"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setOptions([...options, ""])}
            className="flex items-center gap-1 text-sm text-amber-500 hover:text-amber-400"
          >
            <Plus size={14} /> Add option
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" fullWidth>Add Field</Button>
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
  );
}
