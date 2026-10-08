import Link from "next/link";
import type { Metadata } from "next";
import { WHATSAPP_NUMBER } from "@/app/layout";

export const metadata: Metadata = {
  title: "Política de devolución | Guidoco",
  description:
    "Conocé nuestra política de devoluciones y tu derecho de arrepentimiento (Ley 24.240) en Guidoco.",
};

const CONTACT_EMAIL = "guidoco.store@outlook.com";

export default function PoliticaDevolucionPage() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-2xl px-6 py-16 lg:py-24">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/" className="hover:text-zinc-300 transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-zinc-400">Política de devolución</span>
        </nav>

        {/* Encabezado */}
        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Información
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white">
            Política de devolución
          </h1>
          <p className="mt-4 text-sm leading-7 text-zinc-400">
            Queremos que compres con tranquilidad.
          </p>
        </div>

        {/* Derecho de arrepentimiento */}
        <section className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Derecho de arrepentimiento
          </h2>
          <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-6 py-5">
            <p className="text-sm leading-7 text-zinc-300">
              Podés pedir la devolución dentro de los{" "}
              <span className="font-semibold text-white">10 días corridos</span>{" "}
              desde que recibís el producto (art. 34 de la Ley 24.240 de Defensa del
              Consumidor), sin necesidad de dar explicaciones. El producto debe estar
              sin uso, en el mismo estado en que fue entregado y con su protección y
              empaque originales. Se realiza reembolso, no cambios. Pasados los 10 días
              corridos no se aceptan devoluciones por arrepentimiento.
            </p>
          </div>
        </section>

        {/* Cómo solicitarlo */}
        <section className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Cómo solicitarlo
          </h2>
          <p className="mt-4 text-sm leading-7 text-zinc-400">
            Escribinos por{" "}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-zinc-200 underline underline-offset-4 hover:text-white"
            >
              WhatsApp
            </a>{" "}
            o a{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-semibold text-zinc-200 underline underline-offset-4 hover:text-white"
            >
              {CONTACT_EMAIL}
            </a>{" "}
            indicando tu número de pedido. Te enviaremos un código de confirmación
            dentro de las 24 horas.
          </p>
        </section>

        {/* Productos con problemas */}
        <section className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Productos con problemas
          </h2>
          <p className="mt-4 text-sm leading-7 text-zinc-400">
            Si el producto llegó con un defecto o no coincide con la publicación, nos
            hacemos cargo. Escribinos y lo resolvemos.
          </p>
        </section>

        {/* Reembolso */}
        <section className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Reembolso
          </h2>
          <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4">
            <p className="text-lg font-bold text-zinc-400">↩</p>
            <p className="mt-2 text-sm font-semibold text-white">Reembolso por Mercado Pago</p>
            <p className="mt-0.5 text-xs text-zinc-500">
              Se procesa por Mercado Pago dentro de los 7 días hábiles de recibido y
              aprobado el producto devuelto.
            </p>
          </div>
        </section>

        {/* Excepciones */}
        <section className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Excepciones
          </h2>
          <ul className="mt-4 space-y-3">
            {[
              "Productos dañados por mal uso.",
              "Productos intervenidos o alterados luego de la entrega.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-zinc-400">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-700" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-zinc-800 pt-8">
          <Link
            href="/catalogo"
            className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-zinc-950 transition-all hover:bg-zinc-100 active:scale-[0.98]"
          >
            Volver al catálogo
          </Link>
          <Link
            href="/contacto"
            className="rounded-xl border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
          >
            Contacto
          </Link>
        </div>

      </div>
    </main>
  );
}
