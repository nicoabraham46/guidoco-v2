import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin-guard";

// ── POST /api/admin/images ────────────────────────────────────────────────────
// action=upload  → multipart: file, productId
// action=delete  → JSON: { imageId, url }
// action=cover   → JSON: { productId, imageId }
async function detectImageType(file: File): Promise<string | null> {
  const buffer = new Uint8Array(await file.slice(0, 12).arrayBuffer());

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47 &&
    buffer[4] === 0x0d && buffer[5] === 0x0a && buffer[6] === 0x1a && buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  // JPEG: FF D8 FF
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  // GIF: "GIF87a" o "GIF89a"
  if (
    buffer.length >= 6 &&
    buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) && buffer[5] === 0x61
  ) {
    return "image/gif";
  }

  // WEBP: "RIFF" + 4 bytes de tamaño + "WEBP"
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) {
    return "image/webp";
  }

  return null;
}

export async function POST(req: NextRequest) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const contentType = req.headers.get("content-type") ?? "";

  // ── UPLOAD ────────────────────────────────────────────────────────────────
  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const productId = form.get("productId") as string | null;

    if (!file || !productId) {
      return NextResponse.json({ error: "Faltan campos: file, productId" }, { status: 400 });
    }

    const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `El archivo supera el tamaño máximo permitido (${MAX_FILE_SIZE / (1024 * 1024)}MB)` },
        { status: 400 }
      );
    }

    const detectedType = await detectImageType(file);
    if (!detectedType) {
      return NextResponse.json(
        { error: "El archivo no es una imagen válida (JPEG, PNG, WEBP o GIF)" },
        { status: 400 }
      );
    }

    const extByType: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
    };
    const ext = extByType[detectedType];
    const safeName = `${Date.now()}.${ext}`;
    const storagePath = `${productId}/${safeName}`;

    const supabase = getSupabaseAdmin();

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(storagePath, file, { contentType: detectedType, upsert: false });

    if (uploadError) {
      console.error("❌ storage upload:", uploadError.message);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(storagePath);

    // Determine next sort_order
    const { data: existing } = await supabase
      .from("product_images")
      .select("sort_order")
      .eq("product_id", productId)
      .order("sort_order", { ascending: false })
      .limit(1);

    const nextOrder = existing && existing.length > 0
      ? (existing[0].sort_order ?? 0) + 1
      : 0;

    const { data: inserted, error: dbError } = await supabase
      .from("product_images")
      .insert({ product_id: productId, url: urlData.publicUrl, sort_order: nextOrder })
      .select("id, url, sort_order")
      .single();

    if (dbError) {
      console.error("❌ db insert:", dbError.message);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ image: inserted }, { status: 201 });
  }

  // ── JSON actions ──────────────────────────────────────────────────────────
  const body = await req.json() as { action?: string; imageId?: string; url?: string; productId?: string };
  const { action, imageId, url, productId } = body;

  const supabase = getSupabaseAdmin();

  // ── DELETE ────────────────────────────────────────────────────────────────
  if (action === "delete") {
    if (!imageId || !url) {
      return NextResponse.json({ error: "Faltan campos: imageId, url" }, { status: 400 });
    }

    // Extract storage path from public URL
    // URL format: https://<project>.supabase.co/storage/v1/object/public/product-images/<path>
    const storagePath = extractStoragePath(url);
    if (storagePath) {
      const { error: removeError } = await supabase.storage
        .from("product-images")
        .remove([storagePath]);
      if (removeError) {
        console.error("❌ storage remove:", removeError.message);
        // Continue to DB delete even if storage fails
      }
    }

    const { error: dbError } = await supabase
      .from("product_images")
      .delete()
      .eq("id", imageId);

    if (dbError) {
      console.error("❌ db delete:", dbError.message);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  }

  // ── SET COVER ─────────────────────────────────────────────────────────────
  if (action === "cover") {
    if (!productId || !imageId) {
      return NextResponse.json({ error: "Faltan campos: productId, imageId" }, { status: 400 });
    }

    // Fetch all images for product
    const { data: images, error: fetchError } = await supabase
      .from("product_images")
      .select("id, sort_order")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true });

    if (fetchError || !images) {
      return NextResponse.json({ error: fetchError?.message ?? "Not found" }, { status: 500 });
    }

    // Reorder: target → 0, others keep relative order starting from 1
    const others = images.filter((img) => img.id !== imageId);
    const updates = [
      { id: imageId, sort_order: 0 },
      ...others.map((img, i) => ({ id: img.id, sort_order: i + 1 })),
    ];

    // Upsert sort_order for each image
    for (const upd of updates) {
      await supabase
        .from("product_images")
        .update({ sort_order: upd.sort_order })
        .eq("id", upd.id);
    }

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Acción desconocida" }, { status: 400 });
}

function extractStoragePath(publicUrl: string): string | null {
  try {
    const u = new URL(publicUrl);
    // pathname: /storage/v1/object/public/product-images/<storagePath>
    const marker = "/public/product-images/";
    const idx = u.pathname.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(u.pathname.slice(idx + marker.length));
  } catch {
    return null;
  }
}
