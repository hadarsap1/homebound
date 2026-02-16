import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    const empty = {
      address: "",
      price: null,
      bedrooms: null,
      baths: null,
      sqm: null,
      floor: null,
      parking: false,
      elevator: false,
      images: [] as string[],
      source_url: url,
      raw_title: "",
      raw_description: "",
    };

    // Determine site type
    const isFacebook = /facebook\.com|fb\.com|fbcdn/i.test(url);
    const isYad2 = /yad2\.co\.il/i.test(url);
    const isMadlan = /madlan\.co\.il/i.test(url);

    // Fetch with appropriate headers
    let html = "";
    try {
      html = await fetchPage(url, isFacebook);
    } catch {
      return NextResponse.json({ ...empty, error: "Could not fetch page" });
    }

    if (!html || html.length < 100) {
      return NextResponse.json({ ...empty, error: "Empty response from page" });
    }

    // Check if Facebook returned a login page
    if (isFacebook && isLoginPage(html)) {
      // Try extracting from whatever OG tags Facebook still provides
      const ogData = extractOgTags(html);
      return NextResponse.json({
        ...empty,
        address: ogData.title || "",
        raw_title: ogData.title || "",
        raw_description: ogData.description || "",
        images: ogData.image ? [ogData.image] : [],
        error: ogData.title
          ? "Limited data from Facebook. Review and complete manually."
          : "Facebook requires login. Please add details manually.",
      });
    }

    // Extract OG tags
    const og = extractOgTags(html);

    // Try JSON-LD structured data first (most reliable)
    const jsonLd = extractJsonLd(html);

    // Build text corpus for regex matching (OG + visible text)
    const textContent = stripHtml(html);
    const corpus = [
      og.title || "",
      og.description || "",
      textContent,
    ].join("\n");

    // Extract all fields with priority: JSON-LD > OG tags > regex on HTML
    const address =
      jsonLd.address ||
      extractAddress(og.title, og.description, textContent, isYad2, isMadlan, isFacebook) ||
      og.title ||
      "";

    const price =
      jsonLd.price || extractPrice(corpus);

    const bedrooms =
      jsonLd.bedrooms || extractRooms(corpus);

    const baths =
      jsonLd.baths || extractBaths(corpus);

    const sqm =
      jsonLd.sqm || extractSqm(corpus);

    const floor =
      jsonLd.floor ?? extractFloor(corpus);

    const parking =
      jsonLd.parking ?? extractBoolean(corpus, /חניה|חנייה|חנית|חניות|parking|מקום\s*חניה/i);

    const elevator =
      jsonLd.elevator ?? extractBoolean(corpus, /מעלית|elevator|lift/i);

    const contact_phone = extractPhones(corpus);

    // Collect images
    const images: string[] = [];
    if (og.image) images.push(og.image);
    // Additional OG images
    const ogImages = html.matchAll(
      /(?:property|name)=["']og:image["'][^>]*content=["']([^"']+)["']|content=["']([^"']+)["'][^>]*(?:property|name)=["']og:image["']/gi
    );
    for (const m of ogImages) {
      const src = m[1] || m[2];
      if (src && !images.includes(src)) images.push(src);
    }
    // JSON-LD images
    if (jsonLd.images) {
      for (const img of jsonLd.images) {
        if (!images.includes(img)) images.push(img);
      }
    }

    return NextResponse.json({
      address,
      price,
      bedrooms,
      baths,
      sqm,
      floor,
      parking,
      elevator,
      contact_phone,
      images: images.slice(0, 8),
      source_url: url,
      raw_title: og.title || "",
      raw_description: og.description || "",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to parse URL" },
      { status: 500 }
    );
  }
}

// --- Fetch helpers ---

async function fetchPage(url: string, isFacebook: boolean): Promise<string> {
  const headers: Record<string, string> = {
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7",
  };

  if (isFacebook) {
    // Use mobile UA for Facebook — desktop UA returns empty error pages
    headers["User-Agent"] =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
  } else {
    headers["User-Agent"] =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
  }

  const res = await fetch(url, {
    headers,
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

function isLoginPage(html: string): boolean {
  return (
    /login_form|loginbutton|"login"|Log\s*In/i.test(html.slice(0, 30000)) &&
    !/listing|marketplace|product/i.test(html.slice(0, 10000))
  );
}

// --- OG tags ---

function extractOgTags(html: string) {
  return {
    title: extractMeta(html, "og:title"),
    description: extractMeta(html, "og:description"),
    image: extractMeta(html, "og:image"),
    url: extractMeta(html, "og:url"),
  };
}

function extractMeta(html: string, property: string): string | null {
  // property="og:X" content="..."
  const r1 = new RegExp(
    `<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']+)["']`,
    "i"
  );
  // content="..." property="og:X"
  const r2 = new RegExp(
    `<meta[^>]*content=["']([^"']+)["'][^>]*(?:property|name)=["']${property}["']`,
    "i"
  );
  const raw = r1.exec(html)?.[1] || r2.exec(html)?.[1] || null;
  return raw ? decodeEntities(raw) : null;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

// --- JSON-LD ---

interface JsonLdResult {
  address: string | null;
  price: number | null;
  bedrooms: number | null;
  baths: number | null;
  sqm: number | null;
  floor: number | null;
  parking: boolean | null;
  elevator: boolean | null;
  images: string[] | null;
}

function extractJsonLd(html: string): JsonLdResult {
  const result: JsonLdResult = {
    address: null,
    price: null,
    bedrooms: null,
    baths: null,
    sqm: null,
    floor: null,
    parking: null,
    elevator: null,
    images: null,
  };

  const scriptRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1]);
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        parseJsonLdItem(item, result);
        // Check @graph
        if (item["@graph"] && Array.isArray(item["@graph"])) {
          for (const sub of item["@graph"]) {
            parseJsonLdItem(sub, result);
          }
        }
      }
    } catch {
      // Invalid JSON-LD, skip
    }
  }
  return result;
}

function parseJsonLdItem(item: Record<string, unknown>, result: JsonLdResult) {
  const type = String(item["@type"] || "").toLowerCase();

  // RealEstateListing, Product, Residence, Apartment, House, etc.
  if (
    /realestate|product|residence|apartment|house|singlefamily|offer|place/i.test(type) ||
    item.address ||
    item.numberOfRooms
  ) {
    // Address
    if (!result.address) {
      const addr = item.address;
      if (typeof addr === "string") {
        result.address = addr;
      } else if (addr && typeof addr === "object") {
        const a = addr as Record<string, unknown>;
        const parts = [a.streetAddress, a.addressLocality, a.addressRegion]
          .filter(Boolean)
          .map(String);
        if (parts.length) result.address = parts.join(", ");
      }
      if (!result.address && item.name) {
        result.address = String(item.name);
      }
    }

    // Price
    if (!result.price) {
      const price =
        item.price || (item.offers as Record<string, unknown>)?.price;
      if (price) {
        const n = parseFloat(String(price).replace(/[,\s]/g, ""));
        if (!isNaN(n) && n > 1000) result.price = n;
      }
    }

    // Rooms
    if (!result.bedrooms) {
      const rooms = item.numberOfRooms || item.bedrooms || item.numberOfBedrooms;
      if (rooms) {
        const n = parseFloat(String(rooms));
        if (!isNaN(n)) result.bedrooms = n;
      }
    }

    // Baths
    if (!result.baths) {
      const baths = item.numberOfBathroomsTotal || item.numberOfBathrooms;
      if (baths) {
        const n = parseFloat(String(baths));
        if (!isNaN(n)) result.baths = n;
      }
    }

    // Sqm
    if (!result.sqm) {
      const area = item.floorSize || item.area;
      if (area) {
        const val = typeof area === "object" ? (area as Record<string, unknown>).value : area;
        const n = parseFloat(String(val).replace(/[,\s]/g, ""));
        if (!isNaN(n) && n > 5 && n < 10000) result.sqm = n;
      }
    }

    // Images
    if (!result.images) {
      const img = item.image || item.photo;
      if (img) {
        if (Array.isArray(img)) {
          result.images = img
            .map((i) => (typeof i === "string" ? i : (i as Record<string, unknown>)?.url || (i as Record<string, unknown>)?.contentUrl))
            .filter(Boolean)
            .map(String)
            .slice(0, 8);
        } else if (typeof img === "string") {
          result.images = [img];
        }
      }
    }
  }
}

// --- Text extraction ---

function stripHtml(html: string): string {
  // Remove scripts and styles
  let text = html.replace(/<script[\s\S]*?<\/script>/gi, " ");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, " ");
  // Remove tags
  text = text.replace(/<[^>]+>/g, " ");
  // Decode HTML entities (including numeric &#xHEX; and &#DEC;)
  text = decodeEntities(text);
  // Collapse whitespace
  text = text.replace(/\s+/g, " ");
  // Limit to reasonable size
  return text.slice(0, 200000);
}

// --- Field extractors ---

function extractAddress(
  title: string | null,
  description: string | null,
  text: string,
  isYad2: boolean,
  isMadlan: boolean,
  isFacebook: boolean = false
): string | null {
  const sources = [title, description].filter(Boolean) as string[];

  // Facebook group post: OG title = "group name | post snippet | Facebook"
  // The actual listing info is in the OG description
  if (isFacebook) {
    // Try to extract city/location from description first
    const desc = description || "";
    // Look for "ב" + city name pattern (common in Hebrew: "בתל מונד", "ברמת גן")
    const cityMatch = desc.match(
      /\bב([\u0590-\u05FF]{2,}\s*[\u0590-\u05FF]*)\s*[,،.]?\s/
    );
    // Look for "Street Name 12, City" pattern in description
    const streetCityMatch = desc.match(
      /([\u0590-\u05FFa-zA-Z\s']{2,}\s+\d{1,4})\s*,\s*([\u0590-\u05FFa-zA-Z\s']+)/
    );
    if (streetCityMatch) return streetCityMatch[0].trim();
    if (cityMatch) return cityMatch[1].trim();

    // Fallback: use the middle segment of the OG title (between pipes)
    if (title) {
      const parts = title.split("|").map((p) => p.trim());
      // Remove "Facebook" suffix and group name prefix
      const filtered = parts.filter(
        (p) => !/^facebook$/i.test(p) && p.length > 0
      );
      // If there's a middle segment, it might be the post title with location info
      if (filtered.length >= 2) {
        const postTitle = filtered[filtered.length - 1];
        const postCityMatch = postTitle.match(
          /\bב([\u0590-\u05FF]{2,}\s*[\u0590-\u05FF]*)/
        );
        if (postCityMatch) return postCityMatch[1].trim();
      }
    }
    // Don't fall through to generic extraction with Facebook's noisy title
    return null;
  }

  // Yad2 title format: "Type, Street 5, Neighborhood, City | tagline"
  // Madlan title format: similar
  if (isYad2 || isMadlan) {
    for (const s of sources) {
      // Take text before pipe (the tagline is after pipe)
      const beforePipe = s.split("|")[0].trim();
      const parts = beforePipe.split(",").map((p) => p.trim());
      // If we have "Type, Street X, Area, City" — skip first part (type) and join the rest
      if (parts.length >= 3) {
        // Check if second part looks like a street (contains a number)
        if (/\d/.test(parts[1])) {
          return parts.slice(1).join(", ");
        }
        // Otherwise return all parts joined
        return parts.join(", ");
      }
      // If just 2 parts: "Street X, City"
      if (parts.length === 2 && /\d/.test(parts[0])) {
        return beforePipe;
      }
    }
  }

  for (const s of sources) {
    // "Street Name 12, City" or "רחוב הרצל 15, תל אביב"
    const streetCity = s.match(
      /([\u0590-\u05FFa-zA-Z\s']{2,}\s+\d{1,4})\s*,\s*([\u0590-\u05FFa-zA-Z\s']+)/
    );
    if (streetCity) return streetCity[0].trim();

    // Just "Street 12" without city
    const street = s.match(
      /(?:רחוב|רח'|סמטת|שדרות|דרך)\s+[\u0590-\u05FF\s']+\s*\d{1,4}/
    );
    if (street) return street[0].trim();
  }

  // Try from page text — look for labeled address
  const textAddr = text.match(
    /(?:כתובת|address)[:\s]*([\u0590-\u05FFa-zA-Z0-9\s,'.]+?)(?:\s{2,}|$)/i
  );
  if (textAddr) return textAddr[1].trim().slice(0, 100);

  return null;
}

function extractPrice(corpus: string): number | null {
  const patterns: RegExp[] = [
    // ₪ prefix: ₪1,234,567 or ₪ 1,234,567
    /₪\s*([\d,]+(?:\.\d+)?)/,
    // ₪ suffix: 1,234,567₪ or 1,234,567 ₪
    /([\d,]+(?:\.\d+)?)\s*₪/,
    // Shekel word forms: 1,234,567 ש"ח or 1234567 שקל
    /([\d,]+(?:\.\d+)?)\s*(?:ש"ח|ש״ח|שקל|שקלים|shekel|NIS|ILS)/i,
    // "מחיר: 1,234,567" or "מחיר 1,234,567"
    /מחיר[:\s]+([\d,]+)/,
    // "price: 1,234,567" or "Price 1,234,567"
    /price[:\s]+([\d,]+)/i,
    // Million format: "1.5 מיליון" or "2 מיליון"
    /([\d.]+)\s*מיליון/,
  ];

  for (const pat of patterns) {
    const match = corpus.match(pat);
    if (match) {
      let numStr = match[1].replace(/,/g, "");
      let num = parseFloat(numStr);

      // Handle "מיליון" (million)
      if (pat.source.includes("מיליון") && num < 100) {
        num = num * 1000000;
      }

      // Validate: Israeli apartment prices are typically 500K-20M
      if (num >= 100000 && num <= 50000000) return num;
    }
  }

  return null;
}

function extractRooms(corpus: string): number | null {
  const patterns: RegExp[] = [
    // "4 חדרים" or "3.5 חדרים"
    /(\d+(?:[.,]\d)?)\s*חדרי?ם/,
    // "חדרים: 4" or "חדרים 4"
    /חדרי?ם[:\s]+([\d.]+)/,
    // "חד': 4" or "חד' 4"
    /חד['׳][:\s]*([\d.]+)/,
    // English
    /(\d+(?:\.\d)?)\s*(?:rooms?|beds?|bedrooms?)\b/i,
    // "rooms: 4"
    /(?:rooms?|bedrooms?)[:\s]+(\d+(?:\.\d)?)/i,
  ];

  for (const pat of patterns) {
    const match = corpus.match(pat);
    if (match) {
      const n = parseFloat(match[1].replace(",", "."));
      if (n > 0 && n <= 20) return n;
    }
  }
  return null;
}

function extractBaths(corpus: string): number | null {
  const patterns: RegExp[] = [
    /(\d+(?:\.5)?)\s*(?:אמבטי(?:ות|ה)?|מקלחות|שירותים)/,
    /(?:אמבטי(?:ות|ה)?|מקלחות)[:\s]+(\d+(?:\.5)?)/,
    /(\d+(?:\.5)?)\s*(?:bath(?:room)?s?)\b/i,
    /(?:bath(?:room)?s?)[:\s]+(\d+(?:\.5)?)/i,
  ];

  for (const pat of patterns) {
    const match = corpus.match(pat);
    if (match) {
      const n = parseFloat(match[1]);
      if (n > 0 && n <= 10) return n;
    }
  }
  return null;
}

function extractSqm(corpus: string): number | null {
  const patterns: RegExp[] = [
    // "80 מ"ר" or "80 מ״ר"
    /(\d+)\s*(?:מ"ר|מ״ר|מטר|m²|sqm)/i,
    // "שטח: 80" or "שטח 80"
    /שטח[:\s]+(\d+)/,
    // "area: 80"
    /area[:\s]+(\d+)/i,
    // "80 sq.m" or "80 sq m"
    /(\d+)\s*sq\.?\s*m/i,
    // "גודל: 80" or "גודל הנכס: 80"
    /גודל(?:\s*הנכס)?[:\s]+(\d+)/,
  ];

  for (const pat of patterns) {
    const match = corpus.match(pat);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n >= 10 && n <= 2000) return n;
    }
  }
  return null;
}

function extractFloor(corpus: string): number | null {
  const patterns: RegExp[] = [
    // "קומה 3" or "קומה: 3"
    /קומ[הת][:\s]+(\d+)/,
    // "קומת קרקע" = ground floor = 0
    /קומת\s*קרקע/,
    // "floor 3" or "floor: 3"
    /floor[:\s]+(\d+)/i,
    // "3rd floor"
    /(\d+)(?:st|nd|rd|th)\s*floor/i,
    // "קומה 3 מתוך 5"
    /קומ[הת]\s+(\d+)\s*(?:מתוך|מ-|\/)/,
  ];

  for (const pat of patterns) {
    const match = corpus.match(pat);
    if (match) {
      // "קומת קרקע" — no capture group, ground floor
      if (pat.source.includes("קרקע") && match) return 0;
      const n = parseInt(match[1], 10);
      if (n >= 0 && n <= 100) return n;
    }
  }
  return null;
}

function extractBoolean(corpus: string, pattern: RegExp): boolean {
  return pattern.test(corpus);
}

function extractPhones(corpus: string): string | null {
  // Israeli phone number patterns
  const patterns: RegExp[] = [
    // 05X-XXXXXXX or 05X XXXXXXX or 05XXXXXXXXX (mobile)
    /(?:^|[\s,;:(])?(05\d[- ]?\d{3}[- ]?\d{4})(?:[\s,;:)]|$)/g,
    // 0X-XXXXXXX (landline) e.g. 02-1234567, 09-1234567
    /(?:^|[\s,;:(])?(0[2-9][- ]?\d{7})(?:[\s,;:)]|$)/g,
    // +972-5X-XXXXXXX or +972-X-XXXXXXX
    /(\+972[- ]?(?:5\d|[2-9])[- ]?\d{3}[- ]?\d{4})(?:[\s,;:)]|$)/g,
    // 972-5X-XXXXXXX (without +)
    /(972[- ]?(?:5\d|[2-9])[- ]?\d{3}[- ]?\d{4})(?:[\s,;:)]|$)/g,
  ];

  const phones = new Set<string>();

  for (const pat of patterns) {
    let match;
    while ((match = pat.exec(corpus)) !== null) {
      let phone = match[1].replace(/[- ]/g, "");
      // Normalize +972 prefix to 0
      if (phone.startsWith("+972")) {
        phone = "0" + phone.slice(4);
      } else if (phone.startsWith("972") && phone.length >= 11) {
        phone = "0" + phone.slice(3);
      }
      // Validate length: Israeli numbers are 10 digits (0X + 7-8 digits)
      if (phone.length === 10 && /^0[2-9]/.test(phone)) {
        // Format nicely: 05X-XXX-XXXX or 0X-XXXXXXX
        if (phone.startsWith("05")) {
          phone = phone.slice(0, 3) + "-" + phone.slice(3, 6) + "-" + phone.slice(6);
        } else {
          phone = phone.slice(0, 2) + "-" + phone.slice(2);
        }
        phones.add(phone);
      }
    }
  }

  if (phones.size === 0) return null;
  return Array.from(phones).slice(0, 3).join(", ");
}
