let loaded = false;

export function loadGooglePlaces(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (typeof window === "undefined") return Promise.resolve();

  const existing = document.querySelector('script[src*="maps.googleapis.com"]');
  if (existing) {
    loaded = true;
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => {
      loaded = true;
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export type PlaceResult = {
  address: string;
  placeId: string;
  lat: number;
  lng: number;
};
