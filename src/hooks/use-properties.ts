"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/components/providers/supabase-provider";
import { toast } from "sonner";
import type { Property, PropertyInsert, PropertyUpdate, PropertyStatus } from "@/lib/supabase/types";

export function useProperties(status?: PropertyStatus) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["properties", status],
    queryFn: async (): Promise<Property[]> => {
      let query = supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as Property[];
    },
  });
}

export function useProperty(id: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["property", id],
    queryFn: async (): Promise<Property> => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as unknown as Property;
    },
    enabled: !!id,
  });
}

export function useCreateProperty() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (property: Omit<PropertyInsert, "family_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("family_id")
        .eq("id", user.id)
        .single();

      if (!profile?.family_id) throw new Error("No family");

      const { data, error } = await supabase
        .from("properties")
        .insert({ ...property, family_id: profile.family_id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast.success("Property saved");
    },
    onError: () => {
      toast.error("Failed to save property");
    },
  });
}

export function useUpdateProperty() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: PropertyUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("properties")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["property", data.id] });
      toast.success("Property updated");
    },
    onError: () => {
      toast.error("Failed to update property");
    },
  });
}

export function useDeleteProperty() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast.success("Property deleted");
    },
    onError: () => {
      toast.error("Failed to delete property");
    },
  });
}
