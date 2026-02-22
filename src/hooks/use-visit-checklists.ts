"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/components/providers/supabase-provider";
import { toast } from "sonner";
import type { VisitChecklist } from "@/lib/supabase/types";

export function useVisitChecklists(propertyId: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["checklists", propertyId],
    queryFn: async (): Promise<VisitChecklist[]> => {
      const { data, error } = await supabase
        .from("visit_checklists")
        .select("*")
        .eq("property_id", propertyId)
        .order("scheduled_at", { ascending: true });

      if (error) throw error;
      return data as unknown as VisitChecklist[];
    },
    enabled: !!propertyId,
  });
}

export function useCreateVisitChecklist() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (checklist: {
      property_id: string;
      scheduled_at?: string;
      items?: { label: string; checked: boolean; notes?: string }[];
    }) => {
      const defaultItems = [
        { label: "Check water pressure", checked: false },
        { label: "Test electrical outlets", checked: false },
        { label: "Inspect walls & ceiling", checked: false },
        { label: "Check windows & doors", checked: false },
        { label: "Review storage space", checked: false },
        { label: "Check neighborhood noise", checked: false },
        { label: "Verify parking", checked: false },
      ];

      const { data, error } = await supabase
        .from("visit_checklists")
        .insert({
          ...checklist,
          items: checklist.items || defaultItems,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["checklists", data.property_id] });
      toast.success("Visit created");
    },
    onError: () => {
      toast.error("Failed to create visit");
    },
  });
}

export function useUpdateVisitChecklist() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<VisitChecklist> & { id: string }) => {
      const { data, error } = await supabase
        .from("visit_checklists")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["checklists", data.property_id] });
      toast.success("Checklist saved");
    },
    onError: () => {
      toast.error("Failed to save checklist");
    },
  });
}
