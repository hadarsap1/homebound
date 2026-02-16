"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCreateProperty } from "@/hooks/use-properties";
import { useProfile } from "@/hooks/use-profile";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/loading-skeleton";
import { ExternalLink, Check, AlertCircle } from "lucide-react";

interface ParsedData {
  address: string;
  price: number | null;
  bedrooms: number | null;
  sqm: number | null;
  images: string[];
  source_url: string;
  raw_title?: string;
  raw_description?: string;
  error?: string;
}

export default function SharePage() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url") || searchParams.get("text") || "";
  const { data: profile } = useProfile();
  const createProperty = useCreateProperty();

  const [parsed, setParsed] = useState<ParsedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  // Editable fields
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [beds, setBeds] = useState("");
  const [sqm, setSqm] = useState("");

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }

    // Extract URL from text if needed (e.g., shared text might include URL)
    const extractedUrl = extractUrl(url);
    if (!extractedUrl) {
      setLoading(false);
      return;
    }

    fetch("/api/parse-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: extractedUrl }),
    })
      .then((r) => r.json())
      .then((data: ParsedData) => {
        setParsed(data);
        setAddress(data.address || "");
        setPrice(data.price?.toString() || "");
        setBeds(data.bedrooms?.toString() || "");
        setSqm(data.sqm?.toString() || "");
      })
      .catch(() => {
        setParsed({ address: "", price: null, bedrooms: null, sqm: null, images: [], source_url: extractedUrl });
      })
      .finally(() => setLoading(false));
  }, [url]);

  async function handleSave() {
    if (!address.trim()) return;

    await createProperty.mutateAsync({
      address: address.trim(),
      price: price ? parseFloat(price) : null,
      beds: beds ? parseFloat(beds) : null,
      sqm: sqm ? parseFloat(sqm) : null,
      source_url: parsed?.source_url || url,
      status: "new",
    });
    setSaved(true);
  }

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <AlertCircle size={40} className="text-navy-600 mb-3" />
        <h1 className="text-lg font-bold text-navy-300">No URL provided</h1>
        <p className="text-sm text-navy-500 mt-1">
          Share a property listing URL to HomeBound to quickly add it.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-navy-300">Parsing link...</h1>
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
      </div>
    );
  }

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
          <Check size={32} className="text-emerald-400" />
        </div>
        <h1 className="text-lg font-bold text-navy-300">Property saved!</h1>
        <p className="text-sm text-navy-500 mt-1">
          You can find it in your properties list.
        </p>
        <Button className="mt-4" onClick={() => window.location.href = "/properties"}>
          View Properties
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-navy-300">Add from Link</h1>

      {parsed?.source_url && (
        <a
          href={parsed.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-amber-500 hover:text-amber-400 truncate"
        >
          <ExternalLink size={12} />
          {parsed.source_url}
        </a>
      )}

      {parsed?.raw_title && (
        <Card className="py-2">
          <p className="text-xs text-navy-500">Extracted title</p>
          <p className="text-sm text-navy-400">{parsed.raw_title}</p>
        </Card>
      )}

      <div className="space-y-3">
        <Input
          label="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Property address"
          required
        />
        <Input
          label="Price (ILS)"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="e.g. 2500000"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Bedrooms"
            type="number"
            value={beds}
            onChange={(e) => setBeds(e.target.value)}
            placeholder="e.g. 4"
          />
          <Input
            label="Sqm"
            type="number"
            value={sqm}
            onChange={(e) => setSqm(e.target.value)}
            placeholder="e.g. 100"
          />
        </div>
      </div>

      <Button
        fullWidth
        onClick={handleSave}
        disabled={!address.trim() || createProperty.isPending}
      >
        {createProperty.isPending ? "Saving..." : "Save Property"}
      </Button>
    </div>
  );
}

function extractUrl(text: string): string | null {
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/i;
  const match = text.match(urlRegex);
  return match ? match[0] : text.startsWith("http") ? text : null;
}
