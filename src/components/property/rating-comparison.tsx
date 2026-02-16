"use client";

import { Card } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { useProfile, usePartner } from "@/hooks/use-profile";
import type { PropertyRating } from "@/lib/supabase/types";
import { AlertTriangle } from "lucide-react";

interface RatingComparisonProps {
  ratings: PropertyRating[];
}

const CATEGORIES = [
  { key: "overall", label: "Overall" },
  { key: "location", label: "Location" },
  { key: "condition", label: "Condition" },
  { key: "value", label: "Value" },
] as const;

export function RatingComparison({ ratings }: RatingComparisonProps) {
  const { data: profile } = useProfile();
  const { data: partner } = usePartner();

  const myRating = ratings.find((r) => r.profile_id === profile?.id);
  const partnerRating = ratings.find((r) => r.profile_id === partner?.id);

  if (!myRating && !partnerRating) return null;

  const avgOverall =
    myRating && partnerRating
      ? ((myRating.overall + partnerRating.overall) / 2).toFixed(1)
      : (myRating?.overall || partnerRating?.overall || 0).toFixed(1);

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-amber-400">{avgOverall}</span>
        <span className="text-xs text-navy-500">Average Score</span>
      </div>

      <div className="space-y-2">
        {CATEGORIES.map((cat) => {
          const myVal = myRating?.[cat.key] ?? 0;
          const partnerVal = partnerRating?.[cat.key] ?? 0;
          const gap = Math.abs(myVal - partnerVal);

          return (
            <div key={cat.key} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-navy-500">
                <span>{cat.label}</span>
                {gap >= 2 && (
                  <span className="flex items-center gap-1 text-rose-400">
                    <AlertTriangle size={12} /> Gap: {gap}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-xs">
                  <span className="text-navy-500 block mb-0.5">
                    {profile?.display_name || "You"}
                  </span>
                  {myRating ? (
                    <StarRating value={myVal} readOnly size={14} />
                  ) : (
                    <span className="text-navy-600">Not rated</span>
                  )}
                </div>
                <div className="text-xs">
                  <span className="text-navy-500 block mb-0.5">
                    {partner?.display_name || "Partner"}
                  </span>
                  {partnerRating ? (
                    <StarRating value={partnerVal} readOnly size={14} />
                  ) : (
                    <span className="text-navy-600">Not rated</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Notes */}
      {(myRating?.notes || partnerRating?.notes) && (
        <div className="border-t border-navy-800 pt-2 space-y-2">
          {myRating?.notes && (
            <div>
              <span className="text-xs text-navy-500">{profile?.display_name || "You"}:</span>
              <p className="text-sm text-navy-400">{myRating.notes}</p>
            </div>
          )}
          {partnerRating?.notes && (
            <div>
              <span className="text-xs text-navy-500">{partner?.display_name || "Partner"}:</span>
              <p className="text-sm text-navy-400">{partnerRating.notes}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
