"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/components/providers/supabase-provider";
import type { FamilySettings } from "@/lib/supabase/types";

export function useFamilySettings() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["family-settings"],
    queryFn: async (): Promise<FamilySettings | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("family_id")
        .eq("id", user.id)
        .single();

      if (!profile?.family_id) return null;

      const { data, error } = await supabase
        .from("family_settings")
        .select("*")
        .eq("family_id", profile.family_id)
        .single();

      if (error) throw error;
      return data as unknown as FamilySettings;
    },
  });
}

export function useUpdateFamilySettings() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Pick<FamilySettings, "custom_tags" | "custom_field_definitions">>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("family_id")
        .eq("id", user.id)
        .single();

      if (!profile?.family_id) throw new Error("No family");

      const { data, error } = await supabase
        .from("family_settings")
        .update(updates)
        .eq("family_id", profile.family_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family-settings"] });
    },
  });
}
