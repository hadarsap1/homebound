import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; HomeBound/1.0; +https://homebound.app)",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return NextResponse.json({
        address: "",
        price: null,
        bedrooms: null,
        sqm: null,
        images: [],
        source_url: url,
      });
    }

    const html = await res.text();

    // Extract Open Graph meta tags
    const ogTitle = extractMeta(html, "og:title");
    const ogDescription = extractMeta(html, "og:description");
    const ogImage = extractMeta(html, "og:image");
    const title = extractTag(html, "title") || ogTitle || "";

    // Try to extract structured data
    const address = extractAddress(title, ogTitle, ogDescription) || "";
    const price = extractPrice(html, ogDescription);
    const bedrooms = extractRooms(html, ogDescription);
    const sqm = extractSqm(html, ogDescription);

    const images: string[] = [];
    if (ogImage) images.push(ogImage);

    // Try to find additional images
    const imgMatches = html.match(/og:image[^"]*"\s*content="([^"]+)"/g);
    if (imgMatches) {
      for (const match of imgMatches) {
        const src = match.match(/content="([^"]+)"/)?.[1];
        if (src && !images.includes(src)) images.push(src);
      }
    }

    return NextResponse.json({
      address,
      price,
      bedrooms,
      sqm,
      images: images.slice(0, 5),
      source_url: url,
      raw_title: title,
      raw_description: ogDescription || "",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to parse URL" },
      { status: 500 }
    );
  }
}

function extractMeta(html: string, property: string): string | null {
  const regex = new RegExp(
    `<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']+)["']`,
    "i"
  );
  const altRegex = new RegExp(
    `<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${property}["']`,
    "i"
  );
  return regex.exec(html)?.[1] || altRegex.exec(html)?.[1] || null;
}

function extractTag(html: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, "i");
  return regex.exec(html)?.[1]?.trim() || null;
}

function extractAddress(
  title: string,
  ogTitle: string | null,
  description: string | null
): string | null {
  // Common Israeli listing patterns: "Street Name 12, City"
  const sources = [title, ogTitle, description].filter(Boolean) as string[];
  for (const source of sources) {
    // Match Hebrew/English street addresses
    const match = source.match(
      /[\u0590-\u05FFa-zA-Z\s]{2,}\s*\d{1,4}(?:\s*,\s*[\u0590-\u05FFa-zA-Z\s]+)?/
    );
    if (match) return match[0].trim();
  }
  // Fallback: use the title as address
  return ogTitle || title || null;
}

function extractPrice(html: string, description: string | null): number | null {
  const sources = [description || "", html.slice(0, 50000)];
  for (const source of sources) {
    // Match ILS prices: ₪1,234,567 or 1,234,567 ₪ or 1234567 ש"ח
    const match = source.match(
      /₪\s*([\d,]+(?:\.\d+)?)|(?:[\d,]+(?:\.\d+)?)\s*₪|([\d,]+(?:\.\d+)?)\s*ש"?ח/
    );
    if (match) {
      const numStr = (match[1] || match[2] || "").replace(/,/g, "");
      const num = parseFloat(numStr);
      if (num > 100000) return num;
    }
  }
  return null;
}

function extractRooms(
  html: string,
  description: string | null
): number | null {
  const sources = [description || "", html.slice(0, 50000)];
  for (const source of sources) {
    const match = source.match(
      /(\d+(?:\.5)?)\s*(?:חדרים|rooms?|beds?|bedrooms?)/i
    );
    if (match) return parseFloat(match[1]);
  }
  return null;
}

function extractSqm(html: string, description: string | null): number | null {
  const sources = [description || "", html.slice(0, 50000)];
  for (const source of sources) {
    const match = source.match(
      /(\d+)\s*(?:מ"ר|מ״ר|sqm|sq\.?\s*m|m²)/i
    );
    if (match) return parseInt(match[1], 10);
  }
  return null;
}
