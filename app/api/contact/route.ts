import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { nombre, email, telefono, mensaje } = await req.json();

    if (!nombre || !email || !mensaje) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    await resend.emails.send({
      from: "Guidoco Contacto <onboarding@resend.dev>",
      to: process.env.ADMIN_EMAIL || "nicoabraham001@gmail.com",
      subject: `Nuevo mensaje de contacto — ${nombre}`,
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto;">
          <h2 style="color: #1a1a1a; margin-bottom: 24px;">Nuevo mensaje de contacto</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #888; font-size: 13px; width: 100px;">Nombre</td>
              <td style="padding: 8px 0; color: #1a1a1a; font-size: 13px; font-weight: 600;">${nombre}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888; font-size: 13px;">Email</td>
              <td style="padding: 8px 0; color: #1a1a1a; font-size: 13px; font-weight: 600;">${email}</td>
            </tr>
            ${telefono ? `<tr>
              <td style="padding: 8px 0; color: #888; font-size: 13px;">Teléfono</td>
              <td style="padding: 8px 0; color: #1a1a1a; font-size: 13px; font-weight: 600;">${telefono}</td>
            </tr>` : ""}
          </table>
          <div style="margin-top: 24px; padding: 16px; background: #f5f5f5; border-radius: 8px;">
            <p style="color: #888; font-size: 12px; margin: 0 0 8px;">Mensaje</p>
            <p style="color: #1a1a1a; font-size: 14px; margin: 0; white-space: pre-wrap;">${mensaje}</p>
          </div>
          <p style="margin-top: 24px; color: #aaa; font-size: 11px;">Enviado desde guidoco.com.ar</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] Error:", err);
    return NextResponse.json({ error: "Error al enviar el mensaje" }, { status: 500 });
  }
}
