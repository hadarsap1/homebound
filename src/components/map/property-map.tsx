"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { Property, PropertyStatus } from "@/lib/supabase/types";
import { Badge } from "@/components/ui/badge";
import "leaflet/dist/leaflet.css";

const statusColors: Record<PropertyStatus, string> = {
  new: "#22D3EE",
  visited: "#F59E0B",
  interested: "#10B981",
  offer_made: "#A855F7",
  rejected: "#F43F5E",
  archived: "#64748B",
};

function createIcon(status: PropertyStatus) {
  const color = statusColors[status];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="36" viewBox="0 0 24 36">
    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="${color}"/>
    <circle cx="12" cy="12" r="5" fill="white"/>
  </svg>`;

  return L.divIcon({
    html: svg,
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
    className: "",
  });
}

function FitBounds({ properties }: { properties: Property[] }) {
  const map = useMap();

  useEffect(() => {
    const points = properties
      .filter((p) => p.lat && p.lng)
      .map((p) => [p.lat!, p.lng!] as [number, number]);

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [properties, map]);

  return null;
}

interface PropertyMapProps {
  properties: Property[];
  onSelect: (property: Property) => void;
}

export function PropertyMap({ properties, onSelect }: PropertyMapProps) {
  const withCoords = properties.filter((p) => p.lat && p.lng);
  const center = withCoords.length > 0
    ? [withCoords[0].lat!, withCoords[0].lng!] as [number, number]
    : [32.0853, 34.7818] as [number, number]; // Default: Tel Aviv

  return (
    <MapContainer
      center={center}
      zoom={13}
      className="h-full w-full rounded-lg"
      style={{ minHeight: "400px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds properties={withCoords} />
      {withCoords.map((property) => (
        <Marker
          key={property.id}
          position={[property.lat!, property.lng!]}
          icon={createIcon(property.status)}
          eventHandlers={{ click: () => onSelect(property) }}
        >
          <Popup>
            <div className="text-xs">
              <p className="font-semibold">{property.address}</p>
              {property.price && (
                <p className="text-amber-600 font-semibold">
                  {new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(Number(property.price))}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
