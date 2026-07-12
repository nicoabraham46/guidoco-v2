import { NextRequest, NextResponse } from "next/server";
import { createAdminSessionToken, timingSafeEqual } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = formData.get("password") as string;

  const adminKey = process.env.ADMIN_KEY;

  if (!adminKey || !password || !timingSafeEqual(password, adminKey)) {
    return NextResponse.json(
      { error: "Clave incorrecta" },
      { status: 401 }
    );
  }

  const sessionToken = await createAdminSessionToken();
  const response = NextResponse.json({ success: true });

  response.cookies.set("admin_session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 horas
  });

  return response;
}
