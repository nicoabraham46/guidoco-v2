import type { Metadata } from "next";
import NavInicio from "@/components/NavInicio";
import AnnouncementTicker from "@/components/AnnouncementTicker";
import MobileMenu from "@/components/MobileMenu";
import { Poppins } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { CartProvider } from "@/contexts/CartContext";
import CartIcon from "@/components/CartIcon";
import BottomNav from "@/components/BottomNav";
import { PokemonRunner } from "@/components/PokemonRunner";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

export const WHATSAPP_NUMBER = "5491159599081";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Guidoco | Coleccionables originales",
    template: "%s | Guidoco",
  },
  description: "Diecast 1:64, cartas Pokémon y más. Stock real, compra simple y nuevos ingresos frecuentes.",
  openGraph: {
    siteName: "Guidoco",
    type: "website",
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${poppins.className} antialiased text-zinc-100`}
        style={{ backgroundColor: "#e8ecf0" }}
      >
        <CartProvider>
          <AnnouncementTicker />

          {/* ── Header principal ── */}
          <header className="sticky top-0 z-40 border-b border-zinc-800/60 bg-zinc-950/95 backdrop-blur-md" style={{ position: "relative" }}>
            <PokemonRunner />
            <div style={{ position: "relative" }}>
            <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3.5">

              {/* Logo */}
              <Link href="/" className="shrink-0 flex items-center gap-2">
                <Image
                  src="/logo.png"
                  alt="Guidoco Collectibles"
                  width={50}
                  height={50}
                  style={{ objectFit: "contain", borderRadius: "50%" }}
                />
                <div className="flex flex-col md:hidden">
                  <span style={{ color: '#FFD700', fontWeight: 600, fontSize: '14px', lineHeight: 1.2, letterSpacing: '0.05em' }}>GUIDOCO</span>
                  <span style={{ color: '#FFD700', fontWeight: 400, fontSize: '10px', letterSpacing: '0.1em' }}>COLLECTIBLES</span>
                </div>
              </Link>

              {/* Nav */}
              <nav className="hidden items-center gap-6 text-sm md:flex">
                <NavInicio className="font-medium text-zinc-400 transition-colors hover:text-white" />
                <Link href="/catalogo" className="font-medium text-zinc-400 transition-colors hover:text-white">
                  Catálogo
                </Link>
                <Link href="/como-comprar" className="font-medium text-zinc-400 transition-colors hover:text-white">
                  Cómo comprar
                </Link>
                <Link href="/valorar-carta" className="font-medium text-zinc-400 transition-colors hover:text-white">
                  Valorar carta
                </Link>
                <Link href="/contacto" className="font-medium text-zinc-400 transition-colors hover:text-white">
                  Contacto
                </Link>
              </nav>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Search */}
              <form action="/catalogo" method="get" className="hidden items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 transition-colors focus-within:border-zinc-600 lg:flex">
                <svg className="h-4 w-4 shrink-0 text-zinc-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <input
                  type="search"
                  name="q"
                  placeholder="Buscar modelos, Pokémon, etc..."
                  aria-label="Buscar productos"
                  className="w-56 bg-transparent text-sm text-zinc-300 placeholder-zinc-600 outline-none"
                />
              </form>

              {/* Cart */}
              <CartIcon />

              {/* Hamburguesa (mobile) */}
              <MobileMenu />
            </div>
            </div>
          </header>

          <main className="pb-16 md:pb-0">{children}</main>

          {/* ── Footer ── */}
          <footer style={{ backgroundColor: "#1a1a1a" }}>
            <div className="mx-auto max-w-6xl px-6 pt-14 pb-8">

              {/* 4 columnas */}
              <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

                {/* Nosotros */}
                <div>
                  <p className="text-base font-medium text-white">Guidoco</p>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    Tienda especializada en coleccionables. Diecast de alta calidad y Pokémon TCG
                    original para coleccionistas que aprecian lo auténtico.
                  </p>
                </div>

                {/* Navegación */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    Tienda
                  </p>
                  <ul className="mt-4 space-y-2.5">
                    {[
                      { label: "Inicio", href: "/" },
                      { label: "Catálogo", href: "/catalogo" },
                      { label: "Cómo comprar", href: "/como-comprar" },
                      { label: "Preguntas frecuentes", href: "/faq" },
                      { label: "Política de devolución", href: "/politica-de-devolucion" },
                    ].map(({ label, href }) => (
                      <li key={href}>
                        <Link
                          href={href}
                          className="text-sm text-zinc-400 transition-colors hover:text-white"
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Contacto */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    Contacto
                  </p>
                  <ul className="mt-4 space-y-3">
                    <li>
                      <a
                        href={`https://wa.me/${WHATSAPP_NUMBER}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 text-sm text-zinc-400 transition-colors hover:text-white"
                      >
                        <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                        </svg>
                        +54 11 5959 9081
                      </a>
                    </li>
                    <li>
                      <a
                        href="mailto:guidoco.store@outlook.com"
                        className="flex items-center gap-2.5 text-sm text-zinc-400 transition-colors hover:text-white"
                      >
                        <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                        </svg>
                        guidoco.store@outlook.com
                      </a>
                    </li>
                    <li>
                      <span className="flex items-center gap-2.5 text-sm text-zinc-400">
                        <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                        Bernal Centro, Buenos Aires
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Redes */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    Seguinos
                  </p>
                  <p className="mt-4 text-sm text-zinc-500">
                    Próximamente en redes sociales.
                  </p>
                  {/* Íconos de Instagram/TikTok van acá */}
                </div>

              </div>

              {/* Medios de pago */}
              <div className="mt-12 border-t border-white/10 pt-6">
                <div className="flex flex-wrap items-center gap-4">
                  <p className="text-xs text-zinc-500 shrink-0">Medios de pago</p>
                  <div className="flex flex-wrap gap-2">
                    {["Visa", "Mastercard", "Débito", "Transferencia", "Mercado Pago"].map((m) => (
                      <span
                        key={m}
                        className="rounded text-xs text-zinc-400 px-2.5 py-1"
                        style={{ backgroundColor: "#2a2a2a", fontSize: "12px" }}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Copyright */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-zinc-600">
                  © 2025 Guidoco · Todos los derechos reservados
                </p>
                <div className="flex items-center gap-4">
                  <Link href="/politica-de-devolucion" className="text-xs text-zinc-600 transition-colors hover:text-zinc-400">
                    Política de devolución
                  </Link>
                  <Link href="/faq" className="text-xs text-zinc-600 transition-colors hover:text-zinc-400">
                    Preguntas frecuentes
                  </Link>
                </div>
              </div>

            </div>
          </footer>

          <BottomNav />
        </CartProvider>
      </body>
    </html>
  );
}
