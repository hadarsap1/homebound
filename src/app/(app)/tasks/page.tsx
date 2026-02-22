"use client";

import { useState } from "react";
import { useTasks, useToggleTask, useDeleteTask } from "@/hooks/use-tasks";
import { useProfile, usePartner } from "@/hooks/use-profile";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { TaskForm } from "@/components/forms/task-form";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { FilterChips } from "@/components/ui/filter-chips";
import { Skeleton } from "@/components/ui/loading-skeleton";
import { Plus, CheckSquare, Trash2, User } from "lucide-react";
import { format } from "date-fns";

type Filter = "all" | "mine" | "partner";

export default function TasksPage() {
  const { data: tasks, isLoading } = useTasks();
  const { data: profile } = useProfile();
  const { data: partner } = usePartner();
  const toggleTask = useToggleTask();
  const deleteTask = useDeleteTask();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "mine", label: "Mine" },
    { value: "partner", label: partner?.display_name || "Partner" },
  ];

  const filtered = (tasks || []).filter((t) => {
    if (filter === "mine") return t.assigned_to === profile?.id;
    if (filter === "partner") return t.assigned_to === partner?.id;
    return true;
  });

  const open = filtered.filter((t) => !t.completed);
  const completed = filtered.filter((t) => t.completed);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-navy-300">Tasks</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} className="mr-1" /> Add
        </Button>
      </div>

      <FilterChips
        options={filterOptions}
        value={filter}
        onChange={(v) => setFilter(v as Filter)}
      />

      {open.length === 0 && completed.length === 0 ? (
        <EmptyState
          icon={<CheckSquare size={48} />}
          title="No tasks yet"
          description="Create tasks to keep track of your home search to-dos"
          actionLabel="Add Task"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <>
          {open.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-navy-500">
                Open ({open.length})
              </h2>
              {open.map((task) => (
                <Card key={task.id} className="py-3">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTask.mutate({ id: task.id, completed: true })}
                      aria-label={`Complete task: ${task.title}`}
                      className="mt-0.5 h-5 w-5 shrink-0 rounded border border-navy-600 hover:border-amber-500 transition-colors"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-navy-300">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {task.due_date && (
                          <span className="text-xs text-navy-500">
                            {format(new Date(task.due_date), "MMM d")}
                          </span>
                        )}
                        {task.assigned_to && (
                          <span className="flex items-center gap-1 text-xs text-navy-500">
                            <User size={10} />
                            {task.assigned_to === profile?.id
                              ? profile?.display_name || "Me"
                              : partner?.display_name || "Partner"}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setDeleteTaskId(task.id)}
                      aria-label={`Delete task: ${task.title}`}
                      className="text-navy-700 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {completed.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-navy-500">
                Completed ({completed.length})
              </h2>
              {completed.map((task) => (
                <Card key={task.id} className="py-3 opacity-60">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTask.mutate({ id: task.id, completed: false })}
                      aria-label={`Mark "${task.title}" as incomplete`}
                      className="mt-0.5 h-5 w-5 shrink-0 rounded bg-amber-500 flex items-center justify-center"
                    >
                      <CheckSquare size={12} className="text-navy-950" aria-hidden="true" />
                    </button>
                    <p className="flex-1 text-sm text-navy-500 line-through">
                      {task.title}
                    </p>
                    <button
                      onClick={() => setDeleteTaskId(task.id)}
                      aria-label={`Delete task: ${task.title}`}
                      className="text-navy-700 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <BottomSheet open={showForm} onClose={() => setShowForm(false)} title="New Task">
        <TaskForm onDone={() => setShowForm(false)} />
      </BottomSheet>

      <ConfirmModal
        open={!!deleteTaskId}
        onClose={() => setDeleteTaskId(null)}
        title="Delete Task"
        message="Delete this task? This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => {
          if (deleteTaskId) deleteTask.mutate(deleteTaskId);
          setDeleteTaskId(null);
        }}
      />
    </div>
  );
}
