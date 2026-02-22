"use client";

import { useState } from "react";
import { usePropertyRatings, useUpsertRating } from "@/hooks/use-ratings";
import { useProfile } from "@/hooks/use-profile";
import { useFamilySettings } from "@/hooks/use-family-settings";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DynamicFieldInput } from "./dynamic-field-input";
import type { Json, CustomFieldDefinition } from "@/lib/supabase/types";

interface RatingFormProps {
  propertyId: string;
  onDone: () => void;
}

export function RatingForm({ propertyId, onDone }: RatingFormProps) {
  const { data: profile } = useProfile();
  const { data: ratings } = usePropertyRatings(propertyId);
  const { data: settings } = useFamilySettings();
  const upsertRating = useUpsertRating();

  const myRating = ratings?.find((r) => r.profile_id === profile?.id);

  const [overall, setOverall] = useState(myRating?.overall || 3);
  const [location, setLocation] = useState(myRating?.location || 3);
  const [condition, setCondition] = useState(myRating?.condition || 3);
  const [value, setValue] = useState(myRating?.value || 3);
  const [notes, setNotes] = useState(myRating?.notes || "");
  const [metadata, setMetadata] = useState<Record<string, Json>>(
    (myRating?.metadata as Record<string, Json>) || {}
  );

  const fieldDefs: CustomFieldDefinition[] = settings?.custom_field_definitions
    ? (Array.isArray(settings.custom_field_definitions) ? settings.custom_field_definitions as CustomFieldDefinition[] : [])
    : [];
  const ratingFields = fieldDefs.filter((f) => f.entity === "rating");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await upsertRating.mutateAsync({
      property_id: propertyId,
      profile_id: profile!.id,
      overall,
      location,
      condition,
      value,
      notes: notes || null,
      metadata,
    });
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <StarRating label="Overall" value={overall} onChange={setOverall} />
      <StarRating label="Location" value={location} onChange={setLocation} />
      <StarRating label="Condition" value={condition} onChange={setCondition} />
      <StarRating label="Value" value={value} onChange={setValue} />

      {ratingFields.map((field) => (
        <DynamicFieldInput
          key={field.key}
          definition={field}
          value={metadata[field.key]}
          onChange={(val) => setMetadata((p) => ({ ...p, [field.key]: val }))}
        />
      ))}

      <Textarea
        label="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        placeholder="Your thoughts..."
      />

      <Button type="submit" fullWidth disabled={upsertRating.isPending}>
        {upsertRating.isPending ? "Saving..." : "Save Rating"}
      </Button>
    </form>
  );
}
