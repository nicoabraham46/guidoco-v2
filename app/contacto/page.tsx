"use client";

import { useState } from "react";
import type { Metadata } from "next";

const WHATSAPP_URL = "https://wa.me/5491159599081";
const CONTACT_EMAIL = "nicoabraham001@gmail.com";

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 44,
  border: "1px solid #e0e0e0",
  borderRadius: 8,
  padding: "0 12px",
  fontSize: 14,
  color: "#1a1a1a",
  backgroundColor: "#fff",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  color: "#555",
  marginBottom: 6,
};

export default function ContactoPage() {
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "", mensaje: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function focusRed(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    e.target.style.borderColor = "#C0392B";
  }
  function blurGray(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    e.target.style.borderColor = "#e0e0e0";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setForm({ nombre: "", email: "", telefono: "", mensaje: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <main style={{ backgroundColor: "#e8ecf0", minHeight: "100vh", padding: "48px 24px 80px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 40 }}>
          <div style={{ width: 4, height: 36, backgroundColor: "#C0392B", borderRadius: 2, flexShrink: 0, marginTop: 4 }} />
          <h1 style={{ fontSize: 24, fontWeight: 500, color: "#1a1a1a" }}>Contacto</h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }} className="contact-grid">

          {/* Columna izquierda — Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

            {/* Horario */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: "#aaa", marginBottom: 10 }}>
                Horario de atención
              </p>
              <p style={{ fontSize: 14, color: "#444", lineHeight: 1.7 }}>
                Lunes a Sábado: 08:00 a 22:00
              </p>
            </div>

            {/* WhatsApp */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: "#aaa", marginBottom: 10 }}>
                WhatsApp
              </p>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}
              >
                <svg width="20" height="20" fill="#25D366" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
                <span style={{ fontSize: 15, fontWeight: 500, color: "#1a1a1a" }}>+54 11 5959 9081</span>
              </a>
            </div>

            {/* Email */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: "#aaa", marginBottom: 10 }}>
                Email
              </p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}
              >
                <svg width="20" height="20" fill="none" stroke="#555" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                <span style={{ fontSize: 15, fontWeight: 500, color: "#1a1a1a" }}>{CONTACT_EMAIL}</span>
              </a>
            </div>

            {/* Ubicación */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: "#aaa", marginBottom: 10 }}>
                Ubicación
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <svg width="20" height="20" fill="none" stroke="#555" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                <span style={{ fontSize: 15, fontWeight: 500, color: "#1a1a1a" }}>Bernal Centro, Buenos Aires</span>
              </div>
            </div>

          </div>

          {/* Columna derecha — Formulario */}
          <div style={{ backgroundColor: "#fff", borderRadius: 12, border: "0.5px solid #e0e0e0", padding: 28 }}>

            {status === "success" ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <p style={{ fontSize: 20, marginBottom: 8 }}>✓</p>
                <p style={{ fontSize: 16, fontWeight: 600, color: "#1a1a1a", marginBottom: 6 }}>¡Mensaje enviado!</p>
                <p style={{ fontSize: 14, color: "#888" }}>Te respondemos a la brevedad.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                <div>
                  <label style={labelStyle}>Nombre *</label>
                  <input
                    type="text" name="nombre" required value={form.nombre}
                    onChange={handleChange} onFocus={focusRed} onBlur={blurGray}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Email *</label>
                  <input
                    type="email" name="email" required value={form.email}
                    onChange={handleChange} onFocus={focusRed} onBlur={blurGray}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Teléfono</label>
                  <input
                    type="tel" name="telefono" value={form.telefono}
                    onChange={handleChange} onFocus={focusRed} onBlur={blurGray}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Mensaje *</label>
                  <textarea
                    name="mensaje" required value={form.mensaje}
                    onChange={handleChange} onFocus={focusRed} onBlur={blurGray}
                    rows={5}
                    style={{ ...inputStyle, height: "auto", padding: "10px 12px", resize: "vertical", lineHeight: 1.5 }}
                  />
                </div>

                {status === "error" && (
                  <p style={{ fontSize: 13, color: "#C0392B" }}>
                    Error al enviar. Intentá de nuevo o escribinos por WhatsApp.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  style={{
                    width: "100%",
                    height: 48,
                    backgroundColor: "#1a1a1a",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: status === "loading" ? "not-allowed" : "pointer",
                    opacity: status === "loading" ? 0.7 : 1,
                  }}
                >
                  {status === "loading" ? "Enviando..." : "Enviar mensaje"}
                </button>

              </form>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
