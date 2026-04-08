import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getAdminSessionToken } from "@/lib/admin-auth";

async function isAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionValue = cookieStore.get("admin_session")?.value;
    if (!sessionValue) return false;
    const expectedToken = await getAdminSessionToken();
    return sessionValue === expectedToken;
  } catch {
    return false;
  }
}

// ── POST /api/admin/images ────────────────────────────────────────────────────
// action=upload  → multipart: file, productId
// action=delete  → JSON: { imageId, url }
// action=cover   → JSON: { productId, imageId }
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

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Tipo de archivo no permitido" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const safeName = `${Date.now()}.${ext}`;
    const storagePath = `${productId}/${safeName}`;

    const supabase = getSupabaseAdmin();

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(storagePath, file, { contentType: file.type, upsert: false });

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
