"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProperties, useCreateProperty } from "@/hooks/use-properties";
import { PropertyCard } from "@/components/property/property-card";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { PropertyForm } from "@/components/forms/property-form";
import { EmptyState } from "@/components/ui/empty-state";
import { PropertyCardSkeleton } from "@/components/ui/loading-skeleton";
import type { PropertyStatus } from "@/lib/supabase/types";
import { Plus, Search } from "lucide-react";

const FILTERS: { value: PropertyStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "visited", label: "Visited" },
  { value: "interested", label: "Interested" },
  { value: "offer_made", label: "Offer" },
  { value: "rejected", label: "Rejected" },
];

export default function PropertiesPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<PropertyStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const { data: properties, isLoading } = useProperties(
    filter === "all" ? undefined : filter
  );
  const createProperty = useCreateProperty();

  const filtered = properties?.filter((p) =>
    p.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search properties..."
            className="w-full rounded-lg border border-navy-700 bg-navy-900 pl-9 pr-4 py-2.5 text-sm text-navy-300 placeholder-navy-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f.value
                ? "bg-amber-500/20 text-amber-400"
                : "bg-navy-800 text-navy-500"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <PropertyCardSkeleton key={i} />)}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onClick={() => router.push(`/properties/${property.id}`)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No properties yet"
          description="Add your first property to start tracking"
          actionLabel="Add Property"
          onAction={() => setShowAdd(true)}
        />
      )}

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-navy-950 shadow-lg shadow-amber-500/20 active:scale-95 transition-transform"
      >
        <Plus size={24} />
      </button>

      <BottomSheet
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add Property"
        fullHeight
      >
        <PropertyForm
          loading={createProperty.isPending}
          onSubmit={async (data) => {
            await createProperty.mutateAsync(data);
            setShowAdd(false);
          }}
        />
      </BottomSheet>
    </div>
  );
}
