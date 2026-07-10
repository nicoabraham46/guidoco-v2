import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const { productIds } = await request.json();

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ stock: {} });
    }

    const { data, error } = await supabaseServer
      .from("products")
      .select("id,stock")
      .in("id", productIds);

    if (error) {
      console.error("[products/stock] Error:", error);
      return NextResponse.json({ error: "Error al consultar stock" }, { status: 500 });
    }

    const stock: Record<string, number> = {};
    for (const p of data ?? []) {
      stock[p.id] = p.stock ?? 0;
    }

    return NextResponse.json({ stock });
  } catch (err) {
    console.error("[products/stock] Error:", err);
    return NextResponse.json({ error: "Error al consultar stock" }, { status: 500 });
  }
}
