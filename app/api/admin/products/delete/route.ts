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

export async function POST(request: NextRequest) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: "productId requerido" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Primero eliminar las imágenes asociadas del storage y de la tabla
    const { data: images } = await supabase
      .from("product_images")
      .select("id, url")
      .eq("product_id", productId);

    if (images && images.length > 0) {
      // Eliminar archivos del storage
      const filePaths = images
        .map((img) => {
          if (!img.url) return null;
          const match = img.url.match(/product-images\/(.+)$/);
          return match ? match[1] : null;
        })
        .filter((p): p is string => p !== null);

      if (filePaths.length > 0) {
        await supabase.storage.from("product-images").remove(filePaths);
      }

      // Eliminar registros de product_images
      await supabase
        .from("product_images")
        .delete()
        .eq("product_id", productId);
    }

    // Eliminar order_items que referencien este producto (poner product_id en null)
    await supabase
      .from("order_items")
      .update({ product_id: null })
      .eq("product_id", productId);

    // Eliminar el producto
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      console.error("Error deleting product:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete product error:", err);
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
