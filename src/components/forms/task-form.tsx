"use client";

import { useState } from "react";
import { useCreateTask } from "@/hooks/use-tasks";
import { useProfile, usePartner } from "@/hooks/use-profile";
import { useProperties } from "@/hooks/use-properties";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TaskFormProps {
  onDone: () => void;
}

export function TaskForm({ onDone }: TaskFormProps) {
  const createTask = useCreateTask();
  const { data: profile } = useProfile();
  const { data: partner } = usePartner();
  const { data: properties } = useProperties();

  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [propertyId, setPropertyId] = useState<string>("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    await createTask.mutateAsync({
      title: title.trim(),
      due_date: dueDate || null,
      assigned_to: assignedTo || null,
      property_id: propertyId || null,
    });
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        required
      />

      <Input
        label="Due Date"
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />

      <div>
        <label className="block text-sm font-medium text-navy-400 mb-1">
          Assign To
        </label>
        <select
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          className="w-full rounded-lg border border-navy-700 bg-navy-900 px-3 py-2.5 text-sm text-navy-300 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        >
          <option value="">Unassigned</option>
          {profile && (
            <option value={profile.id}>
              {profile.display_name || "Me"}
            </option>
          )}
          {partner && (
            <option value={partner.id}>
              {partner.display_name || "Partner"}
            </option>
          )}
        </select>
      </div>

      {properties && properties.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-navy-400 mb-1">
            Link to Property
          </label>
          <select
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            className="w-full rounded-lg border border-navy-700 bg-navy-900 px-3 py-2.5 text-sm text-navy-300 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="">None</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.address}
              </option>
            ))}
          </select>
        </div>
      )}

      <Button type="submit" fullWidth disabled={createTask.isPending}>
        {createTask.isPending ? "Creating..." : "Create Task"}
      </Button>
    </form>
  );
}
