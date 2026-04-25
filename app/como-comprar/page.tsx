import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cómo comprar | Guidoco",
  description: "Guía paso a paso para comprar en Guidoco. Envíos a todo el país, pago seguro con Mercado Pago.",
};

const STEPS = [
  {
    n: 1,
    title: "Elegí el producto",
    body: "Explorá el catálogo y encontrá lo que estás buscando.",
  },
  {
    n: 2,
    title: "Agregá al carrito",
    body: 'Hacé clic en "Agregar al carrito" en la página del producto.',
  },
  {
    n: 3,
    title: "Revisá tu selección",
    body: "Podés seguir sumando productos o ir directo al carrito cuando estés listo.",
  },
  {
    n: 4,
    title: "Completá tus datos",
    body: "Ingresá tu nombre, email, teléfono y dirección de entrega.",
  },
  {
    n: 5,
    title: "Confirmá la compra",
    body: "Revisá el resumen y enviá el pedido.",
  },
  {
    n: 6,
    title: "Recibí la confirmación",
    body: "Te enviamos un email automático con el detalle del pedido.",
  },
  {
    n: 7,
    title: "Coordinamos el resto",
    body: "Nos contactamos para acordar el pago, envío o entrega según tu ubicación.",
  },
];

export default function ComoComprarPage() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-2xl px-6 py-16 lg:py-24">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/" className="hover:text-zinc-300 transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-zinc-400">Cómo comprar</span>
        </nav>

        {/* Encabezado */}
        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Guía de compra
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white">
            Cómo comprar
          </h1>
          <p className="mt-4 text-sm leading-7 text-zinc-400">
            El proceso es simple. Elegís, pedís y coordinamos el resto juntos.
          </p>
        </div>

        {/* Pasos */}
        <ol className="mt-12 space-y-4">
          {STEPS.map((step, idx) => (
            <li key={step.n} className="flex gap-5">
              {/* Número + línea */}
              <div className="flex flex-col items-center">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-sm font-bold text-white">
                  {step.n}
                </div>
                {idx < STEPS.length - 1 && (
                  <div className="mt-2 w-px flex-1 bg-zinc-800" />
                )}
              </div>

              {/* Contenido */}
              <div className="pb-8">
                <p className="text-sm font-semibold text-white">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-zinc-500">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* Aclaración sobre fotos */}
        <div style={{
          marginTop: 32,
          padding: "20px 24px",
          backgroundColor: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14,
        }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#e4e4e7", marginBottom: 6 }}>
            📸 Sobre las fotos de nuestras cartas
          </p>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "#71717a" }}>
            Todas las cartas Pokémon son nuevas y están en perfecto estado, listas para gradear.
            Las imperfecciones visibles en las fotos se deben al escaneo y los folios protectores.
            El producto que recibís es impecable.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-zinc-800 pt-10">
          <Link
            href="/catalogo"
            className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-zinc-950 transition-all hover:bg-zinc-100 active:scale-[0.98]"
          >
            Ir al catálogo
          </Link>
          <Link
            href="/#contacto"
            className="rounded-xl border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
          >
            Contacto
          </Link>
        </div>

      </div>
    </main>
  );
}
