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
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "orderId requerido" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Eliminar order_items asociados
    await supabase
      .from("order_items")
      .delete()
      .eq("order_id", orderId);

    // Eliminar la orden
    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", orderId);

    if (error) {
      console.error("Error deleting order:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete order error:", err);
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
