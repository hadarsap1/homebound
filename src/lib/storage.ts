import { createClient } from "@/lib/supabase/client";

const MAX_SIZE = 1024 * 1024; // 1MB after compression
const MAX_WIDTH = 1200;
const QUALITY = 0.8;

export async function uploadPropertyImage(
  file: File,
  propertyId: string
): Promise<string> {
  const compressed = await compressImage(file);
  const ext = file.name.split(".").pop() || "jpg";
  const path = `properties/${propertyId}/${Date.now()}.${ext}`;

  const supabase = createClient();
  const { error } = await supabase.storage
    .from("property-images")
    .upload(path, compressed, {
      contentType: compressed.type,
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from("property-images")
    .getPublicUrl(path);

  return data.publicUrl;
}

async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      if (width > MAX_WIDTH) {
        height = (height * MAX_WIDTH) / width;
        width = MAX_WIDTH;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Compression failed"));
            return;
          }
          if (blob.size > MAX_SIZE) {
            // Try again with lower quality
            canvas.toBlob(
              (blob2) => {
                resolve(blob2 || blob);
              },
              "image/jpeg",
              0.5
            );
          } else {
            resolve(blob);
          }
        },
        "image/jpeg",
        QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}
