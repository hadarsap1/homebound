"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/components/providers/supabase-provider";
import { toast } from "sonner";
import type { PropertyRating } from "@/lib/supabase/types";

export function usePropertyRatings(propertyId: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["ratings", propertyId],
    queryFn: async (): Promise<PropertyRating[]> => {
      const { data, error } = await supabase
        .from("property_ratings")
        .select("*")
        .eq("property_id", propertyId);

      if (error) throw error;
      return data as unknown as PropertyRating[];
    },
    enabled: !!propertyId,
  });
}

export function useFamilyRatings() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["ratings", "all"],
    queryFn: async (): Promise<PropertyRating[]> => {
      const { data, error } = await supabase
        .from("property_ratings")
        .select("*");

      if (error) throw error;
      return data as unknown as PropertyRating[];
    },
  });
}

export function useUpsertRating() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      rating: Omit<PropertyRating, "id" | "created_at"> & { id?: string }
    ) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("property_ratings")
        .upsert(
          { ...rating, profile_id: user.id },
          { onConflict: "property_id,profile_id" }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["ratings", data.property_id] });
      toast.success("Rating saved");
    },
    onError: () => {
      toast.error("Failed to save rating");
    },
  });
}
