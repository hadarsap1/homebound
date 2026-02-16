"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProperty, useUpdateProperty, useDeleteProperty } from "@/hooks/use-properties";
import { usePropertyRatings } from "@/hooks/use-ratings";
import { useVisitChecklists } from "@/hooks/use-visit-checklists";
import { useFamilySettings } from "@/hooks/use-family-settings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { PropertyForm } from "@/components/forms/property-form";
import { RatingForm } from "@/components/forms/rating-form";
import { RatingComparison } from "@/components/property/rating-comparison";
import { VisitChecklistForm } from "@/components/forms/visit-checklist-form";
import { VisitChecklistCard } from "@/components/property/visit-checklist-card";
import { Skeleton } from "@/components/ui/loading-skeleton";
import { DynamicFieldInput } from "@/components/forms/dynamic-field-input";
import {
  ArrowLeft, Edit, Trash2, Bed, Bath, Maximize, Car, Building,
  ExternalLink, MapPin, Calendar, Phone,
} from "lucide-react";
import type { Json, CustomFieldDefinition } from "@/lib/supabase/types";

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: property, isLoading } = useProperty(id);
  const { data: ratings } = usePropertyRatings(id);
  const { data: checklists } = useVisitChecklists(id);
  const { data: settings } = useFamilySettings();
  const updateProperty = useUpdateProperty();
  const deleteProperty = useDeleteProperty();

  const [showEdit, setShowEdit] = useState(false);
  const [showRate, setShowRate] = useState(false);
  const [showAddVisit, setShowAddVisit] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!property) {
    return <div className="text-navy-500 text-center py-8">Property not found</div>;
  }

  const priceFormatted = property.price
    ? new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(Number(property.price))
    : null;

  const fieldDefs: CustomFieldDefinition[] = settings?.custom_field_definitions
    ? (Array.isArray(settings.custom_field_definitions) ? settings.custom_field_definitions as CustomFieldDefinition[] : [])
    : [];
  const propertyFields = fieldDefs.filter((f) => f.entity === "property");
  const meta = property.metadata as Record<string, Json>;

  return (
    <div className="space-y-4">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-navy-500 hover:text-navy-400"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy-300">{property.address}</h1>
          {priceFormatted && (
            <p className="text-lg text-amber-500 font-semibold">{priceFormatted}</p>
          )}
        </div>
        <Badge status={property.status} className="text-sm" />
      </div>

      {/* Details */}
      <Card>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {property.beds && (
            <div className="flex items-center gap-2 text-navy-400">
              <Bed size={16} /> {property.beds} Bedrooms
            </div>
          )}
          {property.baths && (
            <div className="flex items-center gap-2 text-navy-400">
              <Bath size={16} /> {property.baths} Bathrooms
            </div>
          )}
          {property.sqm && (
            <div className="flex items-center gap-2 text-navy-400">
              <Maximize size={16} /> {Number(property.sqm)} m²
            </div>
          )}
          {property.floor !== null && (
            <div className="flex items-center gap-2 text-navy-400">
              <Building size={16} /> Floor {property.floor}
            </div>
          )}
          {property.parking && (
            <div className="flex items-center gap-2 text-emerald-400">
              <Car size={16} /> Parking
            </div>
          )}
          {property.elevator && (
            <div className="flex items-center gap-2 text-emerald-400">
              <Building size={16} /> Elevator
            </div>
          )}
        </div>
      </Card>

      {/* Vibe Tags */}
      {property.vibe_tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {property.vibe_tags.map((tag) => (
            <Badge key={tag} variant="tag" label={tag} />
          ))}
        </div>
      )}

      {/* Custom Fields */}
      {propertyFields.length > 0 && Object.keys(meta).length > 0 && (
        <Card>
          <h3 className="text-sm font-medium text-navy-400 mb-2">Custom Fields</h3>
          <div className="space-y-1 text-sm">
            {propertyFields.map((field) => {
              const val = meta[field.key];
              if (val === undefined || val === null || val === "") return null;
              return (
                <div key={field.key} className="flex justify-between text-navy-400">
                  <span>{field.label}</span>
                  <span className="text-navy-300">
                    {typeof val === "boolean" ? (val ? "Yes" : "No") : String(val)}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Notes */}
      {property.notes && (
        <Card>
          <h3 className="text-sm font-medium text-navy-400 mb-1">Notes</h3>
          <p className="text-sm text-navy-300 whitespace-pre-wrap">{property.notes}</p>
        </Card>
      )}

      {/* Contact Phone */}
      {property.contact_phone && (
        <Card>
          <h3 className="text-sm font-medium text-navy-400 mb-1">Contact</h3>
          <div className="flex flex-wrap gap-2">
            {property.contact_phone.split(",").map((phone) => (
              <a
                key={phone.trim()}
                href={`tel:${phone.trim().replace(/[- ]/g, "")}`}
                className="flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300"
              >
                <Phone size={14} /> {phone.trim()}
              </a>
            ))}
          </div>
        </Card>
      )}

      {/* Source URL */}
      {property.source_url && (
        <a
          href={property.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300"
        >
          <ExternalLink size={14} /> View original listing
        </a>
      )}

      {/* Ratings */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy-300">Ratings</h2>
          <Button variant="secondary" onClick={() => setShowRate(true)}>
            Rate
          </Button>
        </div>
        {ratings && ratings.length > 0 ? (
          <RatingComparison ratings={ratings} />
        ) : (
          <p className="text-sm text-navy-500">No ratings yet. Be the first to rate!</p>
        )}
      </div>

      {/* Visit Checklists */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy-300">Visits</h2>
          <Button variant="secondary" onClick={() => setShowAddVisit(true)}>
            <Calendar size={14} className="mr-1" /> Schedule
          </Button>
        </div>
        {checklists && checklists.length > 0 ? (
          <div className="space-y-2">
            {checklists.map((cl) => (
              <VisitChecklistCard key={cl.id} checklist={cl} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-navy-500">No visits scheduled yet.</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button variant="secondary" fullWidth onClick={() => setShowEdit(true)}>
          <Edit size={14} className="mr-1" /> Edit
        </Button>
        <Button
          variant="danger"
          onClick={async () => {
            if (confirm("Delete this property?")) {
              await deleteProperty.mutateAsync(id);
              router.push("/properties");
            }
          }}
        >
          <Trash2 size={14} />
        </Button>
      </div>

      {/* Edit Sheet */}
      <BottomSheet open={showEdit} onClose={() => setShowEdit(false)} title="Edit Property" fullHeight>
        <PropertyForm
          initialData={property}
          loading={updateProperty.isPending}
          onSubmit={async (data) => {
            await updateProperty.mutateAsync({ id, ...data });
            setShowEdit(false);
          }}
        />
      </BottomSheet>

      {/* Rate Sheet */}
      <BottomSheet open={showRate} onClose={() => setShowRate(false)} title="Rate Property">
        <RatingForm propertyId={id} onDone={() => setShowRate(false)} />
      </BottomSheet>

      {/* Add Visit Sheet */}
      <BottomSheet open={showAddVisit} onClose={() => setShowAddVisit(false)} title="Schedule Visit">
        <VisitChecklistForm propertyId={id} onDone={() => setShowAddVisit(false)} />
      </BottomSheet>
    </div>
  );
}
