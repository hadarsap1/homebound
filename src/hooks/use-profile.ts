"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/components/providers/supabase-provider";
import type { Profile } from "@/lib/supabase/types";

export function useProfile() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<Profile | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });
}

export function usePartner() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["partner"],
    queryFn: async (): Promise<Profile | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("family_id")
        .eq("id", user.id)
        .single();

      if (!profile?.family_id) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("family_id", profile.family_id)
        .neq("id", user.id)
        .single();

      if (error) return null;
      return data;
    },
  });
}
