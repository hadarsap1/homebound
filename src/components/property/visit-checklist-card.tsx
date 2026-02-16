"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useUpdateVisitChecklist } from "@/hooks/use-visit-checklists";
import type { VisitChecklist, ChecklistItem } from "@/lib/supabase/types";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, Check } from "lucide-react";

interface VisitChecklistCardProps {
  checklist: VisitChecklist;
}

export function VisitChecklistCard({ checklist }: VisitChecklistCardProps) {
  const [expanded, setExpanded] = useState(false);
  const updateChecklist = useUpdateVisitChecklist();

  const items = (checklist.items || []) as ChecklistItem[];
  const checked = items.filter((i) => i.checked).length;
  const total = items.length;
  const progress = total > 0 ? (checked / total) * 100 : 0;

  async function toggleItem(index: number) {
    const updated = items.map((item, i) =>
      i === index ? { ...item, checked: !item.checked } : item
    );
    const allChecked = updated.every((i) => i.checked);
    await updateChecklist.mutateAsync({
      id: checklist.id,
      items: updated,
      completed: allChecked,
    });
  }

  return (
    <Card>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between"
      >
        <div className="text-left">
          <div className="flex items-center gap-2">
            {checklist.completed && <Check size={14} className="text-emerald-400" />}
            <span className="text-sm font-medium text-navy-300">
              {checklist.scheduled_at
                ? format(new Date(checklist.scheduled_at), "MMM d, yyyy h:mm a")
                : "Unscheduled visit"}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-1.5 w-20 rounded-full bg-navy-800">
              <div
                className="h-full rounded-full bg-amber-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-navy-500">{checked}/{total}</span>
          </div>
        </div>
        {expanded ? <ChevronUp size={16} className="text-navy-500" /> : <ChevronDown size={16} className="text-navy-500" />}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2 border-t border-navy-800 pt-3">
          {items.map((item, i) => (
            <label key={i} className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => toggleItem(i)}
                className="mt-0.5 h-4 w-4 rounded border-navy-700 bg-navy-900 text-amber-500 focus:ring-amber-500"
              />
              <span className={`text-sm ${item.checked ? "text-navy-600 line-through" : "text-navy-300"}`}>
                {item.label}
              </span>
            </label>
          ))}
        </div>
      )}
    </Card>
  );
}
