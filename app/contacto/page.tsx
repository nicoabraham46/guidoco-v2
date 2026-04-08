import Link from "next/link";
import type { Metadata } from "next";
import { WHATSAPP_NUMBER } from "@/app/layout";

export const metadata: Metadata = {
  title: "Contacto — Guidoco",
  description: "Contactanos por WhatsApp o email para consultas sobre productos, compras y envíos.",
};

const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
const CONTACT_EMAIL = "nicoabraham001@gmail.com";

export default function ContactoPage() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-2xl px-6 py-20">

        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Estamos para ayudarte
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white lg:text-5xl">
            Contacto
          </h1>
          <p className="mt-4 text-base leading-relaxed text-zinc-400">
            Si necesitás ayuda con un producto, una compra o un envío, escribinos.
          </p>
        </div>

        {/* Bloques de contacto */}
        <div className="space-y-4">

          {/* WhatsApp */}
          <div className="flex items-start gap-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900">
              <svg className="h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">WhatsApp</p>
              <p className="mt-1 text-base font-semibold text-white">+54 9 11 5959-9081</p>
              <p className="mt-1 text-sm text-zinc-500">La forma más rápida de obtener respuesta.</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900">
              <svg className="h-5 w-5 text-zinc-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">Email</p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="mt-1 block text-base font-semibold text-white transition-colors hover:text-zinc-300 break-all"
              >
                {CONTACT_EMAIL}
              </a>
              <p className="mt-1 text-sm text-zinc-500">Para consultas que no sean urgentes.</p>
            </div>
          </div>

          {/* Horario */}
          <div className="flex items-start gap-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900">
              <svg className="h-5 w-5 text-zinc-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">Horario de respuesta</p>
              <p className="mt-1 text-base font-semibold text-white">Lunes a viernes · 10 a 20 hs</p>
              <p className="mt-1 text-sm text-zinc-500">Respondemos lo antes posible dentro de ese horario.</p>
            </div>
          </div>

        </div>

        {/* CTA WhatsApp */}
        <div className="mt-10">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-900/30 transition-all hover:bg-emerald-500 hover:shadow-emerald-900/50 active:scale-[0.98]"
          >
            <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
            </svg>
            Escribir por WhatsApp
          </a>
        </div>

        {/* FAQ link */}
        <p className="mt-6 text-center text-sm text-zinc-500">
          ¿Tenés dudas sobre el proceso de compra?{" "}
          <Link href="/faq" className="font-medium text-zinc-300 underline underline-offset-4 hover:text-white transition-colors">
            Ver preguntas frecuentes
          </Link>
        </p>

        {/* Volver */}
        <div className="mt-4">
          <Link
            href="/catalogo"
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-800 px-8 py-4 text-sm font-semibold text-zinc-400 transition-colors hover:border-zinc-600 hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Volver al catálogo
          </Link>
        </div>

      </div>
    </main>
  );
}
