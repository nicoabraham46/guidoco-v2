import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-guard";
import { getMiCorreoToken, type AgencyOption } from "@/lib/micorreo";

export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const provinceCode = searchParams.get("provinceCode") || "";
  const postalCode = searchParams.get("postalCode") || "";

  if (!provinceCode) {
    return NextResponse.json({ error: "provinceCode es requerido" }, { status: 400 });
  }

  const customerId = process.env.MICORREO_CUSTOMER_ID?.trim();
  if (!customerId) {
    return NextResponse.json({ error: "MICORREO_CUSTOMER_ID no configurado" }, { status: 500 });
  }

  try {
    const token = await getMiCorreoToken();

    const params = new URLSearchParams({ customerId, provinceCode });
    if (postalCode) params.set("postalCode", postalCode);

    const res = await fetch(`https://api.correoargentino.com.ar/micorreo/v1/agencies?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("[micorreo-agencies] Error de MiCorreo:", res.status, data);
      return NextResponse.json({ error: data?.message || "Error al buscar sucursales" }, { status: res.status });
    }

    const agencies: AgencyOption[] = (Array.isArray(data) ? data : []).map((a: any) => ({
      code: a.code,
      name: a.name,
      streetName: a.location?.address?.streetName ?? "",
      streetNumber: a.location?.address?.streetNumber ?? "",
      locality: a.location?.address?.locality ?? "",
      postalCode: a.location?.address?.postalCode ?? "",
    }));

    return NextResponse.json({ agencies });
  } catch (err) {
    console.error("[micorreo-agencies] Error:", err);
    return NextResponse.json({ error: "Error al conectar con MiCorreo" }, { status: 500 });
  }
}
