"use client";

import { useState } from "react";
import { useCreateTask } from "@/hooks/use-tasks";
import { useProfile, usePartner } from "@/hooks/use-profile";
import { useProperties } from "@/hooks/use-properties";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

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

      <Select
        label="Assign To"
        value={assignedTo}
        onChange={(e) => setAssignedTo(e.target.value)}
        placeholder="Unassigned"
        options={[
          ...(profile ? [{ value: profile.id, label: profile.display_name || "Me" }] : []),
          ...(partner ? [{ value: partner.id, label: partner.display_name || "Partner" }] : []),
        ]}
      />

      {properties && properties.length > 0 && (
        <Select
          label="Link to Property"
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
          placeholder="None"
          options={properties.map((p) => ({ value: p.id, label: p.address }))}
        />
      )}

      <Button type="submit" fullWidth disabled={createTask.isPending}>
        {createTask.isPending ? "Creating..." : "Create Task"}
      </Button>
    </form>
  );
}
