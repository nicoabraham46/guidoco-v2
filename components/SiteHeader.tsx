import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-lg font-semibold tracking-tight">Guidoco</span>
          <span className="text-xs text-gray-500">Diecast / JDM</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-gray-700 md:flex">
          <a className="hover:text-black" href="#catalogo">Catálogo</a>
          <a className="hover:text-black" href="#nuevos">Nuevos</a>
          <a className="hover:text-black" href="#limitados">Limitados</a>
          <a className="hover:text-black" href="#ofertas">Ofertas</a>
        </nav>

        <a
          href="https://wa.me/5491159599081"
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          WhatsApp
        </a>
      </div>
    </header>
  );
}
