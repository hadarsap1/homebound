"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddressAutocomplete } from "./address-autocomplete";
import { DynamicFieldInput } from "./dynamic-field-input";
import { CustomFieldCreator } from "./custom-field-creator";
import { useFamilySettings, useUpdateFamilySettings } from "@/hooks/use-family-settings";
import type { PropertyInsert, PropertyStatus, Json, CustomFieldDefinition } from "@/lib/supabase/types";
import { Plus } from "lucide-react";

const STATUS_OPTIONS: { value: PropertyStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "visited", label: "Visited" },
  { value: "interested", label: "Interested" },
  { value: "offer_made", label: "Offer Made" },
  { value: "rejected", label: "Rejected" },
  { value: "archived", label: "Archived" },
];

interface PropertyFormProps {
  initialData?: Partial<PropertyInsert>;
  onSubmit: (data: Omit<PropertyInsert, "family_id">) => void;
  loading?: boolean;
}

export function PropertyForm({ initialData, onSubmit, loading }: PropertyFormProps) {
  const { data: settings } = useFamilySettings();
  const updateSettings = useUpdateFamilySettings();
  const [showFieldCreator, setShowFieldCreator] = useState(false);

  const [form, setForm] = useState({
    address: initialData?.address || "",
    google_place_id: initialData?.google_place_id || null,
    lat: initialData?.lat || null,
    lng: initialData?.lng || null,
    price: initialData?.price || null,
    beds: initialData?.beds || null,
    baths: initialData?.baths || null,
    sqm: initialData?.sqm || null,
    floor: initialData?.floor || null,
    parking: initialData?.parking || false,
    elevator: initialData?.elevator || false,
    status: initialData?.status || ("new" as PropertyStatus),
    vibe_tags: (initialData?.vibe_tags || []) as string[],
    metadata: (initialData?.metadata || {}) as Record<string, Json>,
    source_url: initialData?.source_url || null,
    contact_phone: initialData?.contact_phone || null,
    notes: initialData?.notes || null,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  function toggleTag(tag: string) {
    setForm((prev) => ({
      ...prev,
      vibe_tags: prev.vibe_tags.includes(tag)
        ? prev.vibe_tags.filter((t) => t !== tag)
        : [...prev.vibe_tags, tag],
    }));
  }

  const tags: string[] = settings?.custom_tags
    ? (Array.isArray(settings.custom_tags) ? settings.custom_tags as string[] : [])
    : [];

  const fieldDefs: CustomFieldDefinition[] = settings?.custom_field_definitions
    ? (Array.isArray(settings.custom_field_definitions) ? settings.custom_field_definitions as CustomFieldDefinition[] : [])
    : [];

  const propertyFields = fieldDefs.filter((f) => f.entity === "property");

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AddressAutocomplete
        value={form.address}
        onChange={(address) => setForm((p) => ({ ...p, address }))}
        onSelect={(place) =>
          setForm((p) => ({
            ...p,
            address: place.address,
            google_place_id: place.placeId,
            lat: place.lat,
            lng: place.lng,
          }))
        }
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Price"
          type="number"
          value={form.price ?? ""}
          onChange={(e) => setForm((p) => ({ ...p, price: e.target.value ? Number(e.target.value) : null }))}
          placeholder="Price"
        />
        <Input
          label="SQM"
          type="number"
          value={form.sqm ?? ""}
          onChange={(e) => setForm((p) => ({ ...p, sqm: e.target.value ? Number(e.target.value) : null }))}
          placeholder="Square meters"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Input
          label="Beds"
          type="number"
          value={form.beds ?? ""}
          onChange={(e) => setForm((p) => ({ ...p, beds: e.target.value ? Number(e.target.value) : null }))}
        />
        <Input
          label="Baths"
          type="number"
          value={form.baths ?? ""}
          onChange={(e) => setForm((p) => ({ ...p, baths: e.target.value ? Number(e.target.value) : null }))}
        />
        <Input
          label="Floor"
          type="number"
          value={form.floor ?? ""}
          onChange={(e) => setForm((p) => ({ ...p, floor: e.target.value ? Number(e.target.value) : null }))}
        />
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.parking}
            onChange={(e) => setForm((p) => ({ ...p, parking: e.target.checked }))}
            className="h-5 w-5 rounded border-navy-700 bg-navy-900 text-amber-500 focus:ring-amber-500"
          />
          <span className="text-sm text-navy-400">Parking</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.elevator}
            onChange={(e) => setForm((p) => ({ ...p, elevator: e.target.checked }))}
            className="h-5 w-5 rounded border-navy-700 bg-navy-900 text-amber-500 focus:ring-amber-500"
          />
          <span className="text-sm text-navy-400">Elevator</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-400 mb-1">Status</label>
        <select
          value={form.status}
          onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as PropertyStatus }))}
          className="block w-full rounded-lg border border-navy-700 bg-navy-900 px-4 py-3 text-navy-300 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {tags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-navy-400 mb-2">Vibe Tags</label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  form.vibe_tags.includes(tag)
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-navy-800 text-navy-400 border border-navy-700"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {propertyFields.length > 0 && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-navy-400">Custom Fields</label>
          {propertyFields.map((field) => (
            <DynamicFieldInput
              key={field.key}
              definition={field}
              value={form.metadata[field.key]}
              onChange={(val) =>
                setForm((p) => ({
                  ...p,
                  metadata: { ...p.metadata, [field.key]: val },
                }))
              }
            />
          ))}
        </div>
      )}

      {showFieldCreator ? (
        <CustomFieldCreator
          entity="property"
          onAdd={async (field) => {
            const current = settings?.custom_field_definitions || [];
            const defs = Array.isArray(current) ? current : [];
            await updateSettings.mutateAsync({
              custom_field_definitions: [...defs, field],
            });
            setShowFieldCreator(false);
          }}
          onCancel={() => setShowFieldCreator(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowFieldCreator(true)}
          className="flex items-center gap-1 text-sm text-amber-500 hover:text-amber-400"
        >
          <Plus size={14} /> Add Custom Field
        </button>
      )}

      <Input
        label="Contact Phone"
        type="tel"
        value={form.contact_phone ?? ""}
        onChange={(e) => setForm((p) => ({ ...p, contact_phone: e.target.value || null }))}
        placeholder="05X-XXX-XXXX"
      />

      <div>
        <label className="block text-sm font-medium text-navy-400 mb-1">Notes</label>
        <textarea
          value={form.notes || ""}
          onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value || null }))}
          rows={3}
          className="block w-full rounded-lg border border-navy-700 bg-navy-900 px-4 py-3 text-navy-300 placeholder-navy-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          placeholder="Any notes..."
        />
      </div>

      <Button type="submit" fullWidth disabled={loading || !form.address}>
        {loading ? "Saving..." : initialData?.address ? "Update Property" : "Add Property"}
      </Button>
    </form>
  );
}
