"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProperties } from "@/hooks/use-properties";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/loading-skeleton";
import type { Property, PropertyStatus } from "@/lib/supabase/types";

const PropertyMap = dynamic(
  () => import("@/components/map/property-map").then((m) => m.PropertyMap),
  { ssr: false, loading: () => <Skeleton className="h-[calc(100vh-200px)]" /> }
);

const STATUSES: { value: PropertyStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "visited", label: "Visited" },
  { value: "interested", label: "Interested" },
  { value: "offer_made", label: "Offer" },
  { value: "rejected", label: "Rejected" },
];

export default function MapPage() {
  const router = useRouter();
  const { data: properties, isLoading } = useProperties();
  const [filter, setFilter] = useState<PropertyStatus | "all">("all");

  const filtered =
    filter === "all"
      ? properties || []
      : (properties || []).filter((p) => p.status === filter);

  function handleSelect(property: Property) {
    router.push(`/properties/${property.id}`);
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold text-navy-300">Map</h1>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {STATUSES.map((s) => (
          <button key={s.value} onClick={() => setFilter(s.value)}>
            <Badge variant={filter === s.value ? "default" : "outline"}>
              {s.label}
            </Badge>
          </button>
        ))}
      </div>

      <div className="h-[calc(100vh-220px)] rounded-lg overflow-hidden">
        {isLoading ? (
          <Skeleton className="h-full" />
        ) : (
          <PropertyMap properties={filtered} onSelect={handleSelect} />
        )}
      </div>
    </div>
  );
}
