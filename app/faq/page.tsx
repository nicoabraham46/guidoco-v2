"use client";

import Link from "next/link";
import { useState } from "react";

const FAQS = [
  {
    q: "¿Los productos son originales?",
    a: "Sí. Trabajamos únicamente con productos originales.",
  },
  {
    q: "¿Por qué las fotos de las cartas tienen imperfecciones?",
    a: "Todas nuestras cartas Pokémon son nuevas y están en perfecto estado, listas para gradear. Las imperfecciones que puedas ver en las fotos se deben al proceso de escaneo y a los folios protectores que usamos para conservarlas. El producto que recibís es impecable.",
  },
  {
    q: "¿Hacen envíos a todo el país?",
    a: "Sí, realizamos envíos a todo el país y también coordinamos entregas según el caso.",
  },
  {
    q: "¿Cómo se coordina el pago?",
    a: "Una vez que confirmás tu compra, el pago se procesa automáticamente a través de Mercado Pago. Podés pagar con tarjeta de crédito, débito o transferencia bancaria. Si tenés algún problema, escribinos por WhatsApp al +54 11 5959 9081.",
  },
  {
    q: "¿Qué pasa después de comprar?",
    a: "Al completar tu compra recibís un email automático de confirmación con el detalle de tu pedido. Nosotros recibimos tu orden y nos ponemos en contacto para coordinar el envío. Podés seguir el estado de tu pedido escribiéndonos por WhatsApp al +54 11 5959 9081.",
  },
  {
    q: "¿Puedo consultar antes de comprar?",
    a: "Sí, podés escribirnos antes de comprar si querés confirmar cualquier detalle.",
  },
  {
    q: "¿Aceptan cambios o devoluciones?",
    a: "Sí, según las condiciones publicadas en la política de devolución.",
  },
];

function AccordionItem({
  q,
  a,
  open,
  onToggle,
}: {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`rounded-2xl border transition-colors duration-200 ${open ? "border-zinc-600 bg-zinc-900" : "border-zinc-800 bg-zinc-900/50"}`}>
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
        aria-expanded={open}
      >
        <span className={`text-sm font-semibold leading-snug transition-colors ${open ? "text-white" : "text-zinc-300"}`}>
          {q}
        </span>
        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${open ? "border-zinc-500 bg-zinc-700 text-white rotate-45" : "border-zinc-700 bg-zinc-800/60 text-zinc-500"}`}>
          <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </span>
      </button>

      {open && (
        <div className="px-6 pb-5">
          <div className="h-px bg-zinc-800 mb-4" />
          <p className="text-sm leading-relaxed text-zinc-400">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(i: number) {
    setOpenIndex(openIndex === i ? null : i);
  }

  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-2xl px-6 py-20">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-white lg:text-5xl">
            Preguntas frecuentes
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400">
            Si no encontrás lo que buscás,{" "}
            <Link href="/contacto" className="font-medium text-zinc-300 underline underline-offset-4 hover:text-white transition-colors">
              escribinos directamente
            </Link>
            .
          </p>
        </div>

        {/* Acordeón */}
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <AccordionItem
              key={i}
              q={faq.q}
              a={faq.a}
              open={openIndex === i}
              onToggle={() => toggle(i)}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-zinc-800 bg-zinc-900/50 px-6 py-6 text-center">
          <p className="text-sm font-semibold text-zinc-300">¿Todavía tenés dudas?</p>
          <p className="mt-1 text-sm text-zinc-500">Respondemos rápido por WhatsApp.</p>
          <a
            href="https://wa.me/5491159599081"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/30 transition-all hover:bg-emerald-500 active:scale-[0.98]"
          >
            <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
            </svg>
            Escribir por WhatsApp
          </a>
        </div>

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
