"use client";

import { useEffect, useRef, useState } from "react";
import { loadGooglePlaces, type PlaceResult } from "@/lib/google-places";
import { Input } from "@/components/ui/input";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (place: PlaceResult) => void;
}

export function AddressAutocomplete({ value, onChange, onSelect }: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadGooglePlaces().then(() => setReady(true)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!ready || !inputRef.current || autocompleteRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ["address"],
      fields: ["formatted_address", "place_id", "geometry"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.formatted_address && place.place_id && place.geometry?.location) {
        onSelect({
          address: place.formatted_address,
          placeId: place.place_id,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
        onChange(place.formatted_address);
      }
    });

    autocompleteRef.current = autocomplete;
  }, [ready, onSelect, onChange]);

  return (
    <Input
      ref={inputRef}
      label="Address"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Start typing an address..."
    />
  );
}
