"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Property } from "@/lib/supabase/types";
import { Bed, Bath, Maximize, ExternalLink } from "lucide-react";

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
}

export function PropertyCard({ property, onClick }: PropertyCardProps) {
  const priceFormatted = property.price
    ? new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(Number(property.price))
    : null;

  return (
    <Card onClick={onClick} className="space-y-2">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-navy-300 truncate">{property.address}</h3>
          {priceFormatted && (
            <p className="text-amber-500 font-semibold mt-0.5">{priceFormatted}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 ml-2">
          {property.source_url && (
            <ExternalLink size={14} className="text-navy-500" />
          )}
          <Badge status={property.status} />
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-navy-500">
        {property.beds && (
          <span className="flex items-center gap-1">
            <Bed size={14} /> {property.beds}
          </span>
        )}
        {property.baths && (
          <span className="flex items-center gap-1">
            <Bath size={14} /> {property.baths}
          </span>
        )}
        {property.sqm && (
          <span className="flex items-center gap-1">
            <Maximize size={14} /> {Number(property.sqm)}m²
          </span>
        )}
        {property.floor !== null && property.floor !== undefined && (
          <span>Floor {property.floor}</span>
        )}
      </div>

      {property.vibe_tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {property.vibe_tags.map((tag) => (
            <Badge key={tag} variant="tag" label={tag} />
          ))}
        </div>
      )}
    </Card>
  );
}
