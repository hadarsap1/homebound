"use client";

import { useState } from "react";
import { useCreateVisitChecklist } from "@/hooks/use-visit-checklists";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface VisitChecklistFormProps {
  propertyId: string;
  onDone: () => void;
}

const DEFAULT_ITEMS = [
  "Check water pressure",
  "Test electrical outlets",
  "Inspect walls & ceiling",
  "Check windows & doors",
  "Review storage space",
  "Check neighborhood noise",
  "Verify parking",
];

export function VisitChecklistForm({ propertyId, onDone }: VisitChecklistFormProps) {
  const createChecklist = useCreateVisitChecklist();
  const [scheduledAt, setScheduledAt] = useState("");
  const [items, setItems] = useState(
    DEFAULT_ITEMS.map((label) => ({ label, checked: false }))
  );
  const [newItem, setNewItem] = useState("");

  function addItem() {
    if (!newItem.trim()) return;
    setItems([...items, { label: newItem.trim(), checked: false }]);
    setNewItem("");
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createChecklist.mutateAsync({
      property_id: propertyId,
      scheduled_at: scheduledAt || undefined,
      items,
    });
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Visit Date & Time"
        type="datetime-local"
        value={scheduledAt}
        onChange={(e) => setScheduledAt(e.target.value)}
      />

      <div>
        <label className="block text-sm font-medium text-navy-400 mb-2">Checklist Items</label>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="flex-1 text-sm text-navy-300 bg-navy-800 rounded-lg px-3 py-2">
                {item.label}
              </span>
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="text-navy-600 hover:text-rose-400"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-2">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add item..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addItem();
              }
            }}
          />
          <Button type="button" variant="secondary" onClick={addItem}>
            <Plus size={16} />
          </Button>
        </div>
      </div>

      <Button type="submit" fullWidth disabled={createChecklist.isPending}>
        {createChecklist.isPending ? "Creating..." : "Create Visit"}
      </Button>
    </form>
  );
}
