"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useProperties, useCreateProperty } from "@/hooks/use-properties";
import { PropertyCard } from "@/components/property/property-card";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { PropertyForm } from "@/components/forms/property-form";
import { EmptyState } from "@/components/ui/empty-state";
import { PropertyCardSkeleton } from "@/components/ui/loading-skeleton";
import { FilterChips } from "@/components/ui/filter-chips";
import type { PropertyStatus, PropertyInsert } from "@/lib/supabase/types";
import { Plus, Search, Link, Loader2, X } from "lucide-react";

const FILTERS: { value: PropertyStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "visited", label: "Visited" },
  { value: "interested", label: "Interested" },
  { value: "offer_made", label: "Offer" },
  { value: "rejected", label: "Rejected" },
];

interface ParsedResult {
  address: string;
  price: number | null;
  bedrooms: number | null;
  baths: number | null;
  sqm: number | null;
  floor: number | null;
  parking: boolean;
  elevator: boolean;
  contact_phone: string | null;
  images: string[];
  source_url: string;
  raw_title?: string;
  raw_description?: string;
  error?: string;
}

export default function PropertiesPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<PropertyStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  // Link paste state
  const [linkInput, setLinkInput] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const [prefilled, setPrefilled] = useState<Partial<PropertyInsert> | null>(null);

  const { data: properties, isLoading } = useProperties(
    filter === "all" ? undefined : filter
  );
  const createProperty = useCreateProperty();

  const filtered = properties?.filter((p) =>
    p.address.toLowerCase().includes(search.toLowerCase())
  );

  const handlePasteLink = useCallback(async (rawInput: string) => {
    const urlMatch = rawInput.match(/https?:\/\/[^\s<>"{}|\\^`[\]]+/i);
    const url = urlMatch ? urlMatch[0] : rawInput.startsWith("http") ? rawInput : null;
    if (!url) {
      setParseError("No valid URL found");
      return;
    }

    setParsing(true);
    setParseError("");
    try {
      const res = await fetch("/api/parse-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data: ParsedResult = await res.json();
      if (data.error) {
        setParseError("Could not parse link. You can still add manually.");
      }
      setPrefilled({
        address: data.address || "",
        price: data.price,
        beds: data.bedrooms,
        baths: data.baths,
        sqm: data.sqm,
        floor: data.floor,
        parking: data.parking ?? false,
        elevator: data.elevator ?? false,
        contact_phone: data.contact_phone || null,
        source_url: data.source_url || url,
      });
      setShowAdd(true);
      setLinkInput("");
    } catch {
      setParseError("Failed to fetch link. Try again.");
    } finally {
      setParsing(false);
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Paste Link Bar */}
      <div className="rounded-lg border border-amber-500/30 bg-navy-900 p-3 space-y-2">
        <p className="text-xs font-medium text-amber-500 mb-1">Quick Add from Link</p>
        <div className="flex items-center gap-2">
          <Link size={16} className="text-amber-500 shrink-0" />
          <input
            value={linkInput}
            onChange={(e) => {
              setLinkInput(e.target.value);
              setParseError("");
            }}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData("text");
              if (pasted && /https?:\/\//i.test(pasted)) {
                e.preventDefault();
                setLinkInput(pasted);
                handlePasteLink(pasted);
              }
            }}
            placeholder="Paste a listing link (Yad2, Facebook...)"
            className="flex-1 bg-transparent text-sm text-navy-300 placeholder-navy-600 outline-none"
            disabled={parsing}
          />
          {linkInput && !parsing && (
            <button onClick={() => { setLinkInput(""); setParseError(""); }} className="text-navy-600" aria-label="Clear link">
              <X size={14} aria-hidden="true" />
            </button>
          )}
          {parsing ? (
            <Loader2 size={18} className="text-amber-500 animate-spin" />
          ) : linkInput ? (
            <button
              onClick={() => handlePasteLink(linkInput)}
              className="shrink-0 rounded-md bg-amber-500 px-3 py-1 text-xs font-medium text-navy-950"
            >
              Add
            </button>
          ) : null}
        </div>
        {parseError && (
          <p className="text-xs text-rose-400">{parseError}</p>
        )}
      </div>

      {/* Search */}
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

      <FilterChips
        options={FILTERS}
        value={filter}
        onChange={(v) => setFilter(v as PropertyStatus | "all")}
      />

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
          description="Paste a listing link above or tap + to add manually"
          actionLabel="Add Property"
          onAction={() => setShowAdd(true)}
        />
      )}

      {/* FAB */}
      <button
        onClick={() => {
          setPrefilled(null);
          setShowAdd(true);
        }}
        aria-label="Add property"
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-navy-950 shadow-lg shadow-amber-500/20 active:scale-95 transition-transform"
      >
        <Plus size={24} aria-hidden="true" />
      </button>

      <BottomSheet
        open={showAdd}
        onClose={() => { setShowAdd(false); setPrefilled(null); }}
        title={prefilled?.source_url ? "Add from Link" : "Add Property"}
        fullHeight
      >
        <PropertyForm
          initialData={prefilled || undefined}
          loading={createProperty.isPending}
          onSubmit={async (data) => {
            await createProperty.mutateAsync(data);
            setShowAdd(false);
            setPrefilled(null);
          }}
        />
      </BottomSheet>
    </div>
  );
}
