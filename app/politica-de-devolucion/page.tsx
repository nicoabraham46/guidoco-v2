import Link from "next/link";

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

        {/* Bloque principal */}
        <div className="mt-10 space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-6 py-5">
          <p className="text-sm leading-7 text-zinc-300">
            Aceptamos cambios o devoluciones dentro de los{" "}
            <span className="font-semibold text-white">10 días corridos</span>{" "}
            desde la recepción del producto, siempre que el artículo se encuentre
            en el mismo estado en que fue entregado.
          </p>
        </div>

        {/* Condiciones */}
        <section className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Condiciones
          </h2>
          <ul className="mt-4 space-y-3">
            {[
              "El producto debe estar sin uso, completo y en su empaque original.",
              "Si el producto llegó con un problema o no coincide con la publicación, nos hacemos cargo.",
              "Si la devolución es por decisión del comprador, el costo de envío corre por cuenta del cliente.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-zinc-400">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-600" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Opciones */}
        <section className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Opciones disponibles
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              { icon: "↔", label: "Cambio del producto", desc: "Por otro producto disponible en el catálogo." },
              { icon: "↩", label: "Reembolso por Mercado Pago", desc: "Procesamos el reembolso a través de Mercado Pago dentro de los 7 días hábiles de aprobada la devolución." },
            ].map(({ icon, label, desc }) => (
              <div
                key={label}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4"
              >
                <p className="text-lg font-bold text-zinc-400">{icon}</p>
                <p className="mt-2 text-sm font-semibold text-white">{label}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{desc}</p>
              </div>
            ))}
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
              "Productos sin empaque original.",
              "Productos intervenidos o alterados luego de la entrega.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-zinc-400">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-700" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Cierre */}
        <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900/40 px-6 py-5">
          <p className="text-sm leading-7 text-zinc-400">
            Si necesitás ayuda con una compra, escribinos y lo resolvemos.
          </p>
        </div>

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
