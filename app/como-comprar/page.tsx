import Link from "next/link";
import type { Metadata } from "next";
import CardConditionGuide from "@/components/CardConditionGuide";

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
    body: "Ingresá tu nombre, email, teléfono y dirección de entrega. No necesitás crear una cuenta.",
  },
  {
    n: 5,
    title: "Confirmá la compra",
    body: "Revisá el resumen y enviá el pedido.",
  },
  {
    n: 6,
    title: "Recibí la confirmación",
    body: "Te enviamos un email automático con el detalle de tu pedido.",
  },
  {
    n: 7,
    title: "Coordinamos el resto",
    body: "El costo de envío se calcula automáticamente en el checkout según tu código postal. Entrega en mano gratis en zona Quilmes y alrededores.",
  },
];

export default function ComoComprarPage() {
  return (
    <main
      className="min-h-screen"
      style={{ position: "relative", backgroundColor: "#e8ecf0" }}
    >
      {/* Fondo con imagen */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: "url(/como-comprar-bg.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "grayscale(20%)",
          opacity: 0.18,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <div className="mx-auto max-w-2xl px-6 py-16 lg:py-24" style={{ position: "relative", zIndex: 1 }}>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="hover:text-gray-700 transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-gray-600">Cómo comprar</span>
        </nav>

        {/* Encabezado */}
        <div className="mt-8 flex items-start gap-4">
          <div style={{ width: 4, height: 42, backgroundColor: "#C0392B", borderRadius: 2, flexShrink: 0, marginTop: 6 }} />
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
              Cómo comprar
            </h1>
            <p className="mt-3 text-sm leading-7 text-gray-500">
              El proceso es simple. Elegís, pedís y coordinamos el resto juntos.
            </p>
          </div>
        </div>

        {/* Pasos — estilo recibo */}
        <ol className="mt-14 space-y-0 divide-y divide-gray-200">
          {STEPS.map((step) => (
            <li key={step.n} className="flex gap-6 py-6">
              <span
                style={{ fontSize: 32, fontWeight: 800, color: "#C0392B", lineHeight: 1, minWidth: 40 }}
              >
                {step.n}
              </span>
              <div className="pt-1">
                <p className="text-sm font-semibold text-gray-900">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* Confianza y datos */}
        <div className="mt-12 rounded-xl border border-gray-200 bg-white px-6 py-6">
          <p className="text-sm font-semibold text-gray-900 mb-4">
            Comprá tranquilo
          </p>
          <ul className="space-y-3">
            <li className="flex gap-3 text-sm text-gray-600">
              <span className="text-[#C0392B]">•</span>
              No necesitás crear una cuenta. Comprás como invitado y todos los datos de tu pedido quedan registrados en el email de confirmación que te enviamos.
            </li>
            <li className="flex gap-3 text-sm text-gray-600">
              <span className="text-[#C0392B]">•</span>
              Tus datos personales son seguros: nunca se publican ni se comparten con nadie.
            </li>
            <li className="flex gap-3 text-sm text-gray-600">
              <span className="text-[#C0392B]">•</span>
              El email de confirmación es tu comprobante — no necesitás guardar nada más.
            </li>
          </ul>
        </div>

        {/* Aclaración sobre fotos */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-white px-6 py-6">
          <p className="text-sm font-semibold text-gray-900 mb-2">
            Sobre las fotos de nuestras cartas
          </p>
          <p className="text-sm leading-relaxed text-gray-600">
            La mayoría de las cartas son nuevas y están en perfecto estado, listas para gradear. Las imperfecciones visibles en las fotos de las cartas nuevas se deben al escaneo y los folios protectores. Si una carta es usada o presenta algún detalle particular, se indica en la descripción del producto.
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
          <CardConditionGuide variant="text" />
        </div>

        {/* Aclaración sobre el nombre en Mercado Pago */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-white px-6 py-6">
          <p className="text-sm font-semibold text-gray-900 mb-2">
            Sobre el pago con Mercado Pago
          </p>
          <p className="text-sm leading-relaxed text-gray-600">
            Al pagar vas a ver el nombre "Luciana" en el checkout y en el email de confirmación de Mercado Pago. Es la cuenta autorizada de Guidoco para recibir los pagos — todo en orden, podés continuar tranquilo/a.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-gray-200 pt-10">
          <Link
            href="/catalogo"
            className="rounded-xl bg-[#1a1a1a] px-6 py-3 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
          >
            Ir al catálogo
          </Link>
          <Link
            href="/contacto"
            className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-500 hover:text-gray-900"
          >
            Contacto
          </Link>
        </div>

      </div>
    </main>
  );
}
