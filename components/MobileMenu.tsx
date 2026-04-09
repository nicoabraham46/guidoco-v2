"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { label: "Inicio", href: "/" },
  { label: "Catálogo", href: "/catalogo" },
  { label: "Cómo comprar", href: "/como-comprar" },
  { label: "Contacto", href: "/contacto" },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Botón hamburguesa / cerrar */}
      <button
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center md:hidden"
        style={{ color: "white", background: "none", border: "none", padding: "4px", cursor: "pointer" }}
      >
        {open ? (
          // ✕
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        ) : (
          // ☰
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        )}
      </button>

      {/* Menú desplegable */}
      {open && (
        <div
          className="absolute left-0 right-0 top-full z-50 md:hidden"
          style={{ backgroundColor: "#1a1a1a" }}
        >
          <nav>
            {links.map(({ label, href }, i) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="block px-6 py-4 text-sm font-medium transition-colors hover:text-white"
                style={{
                  color: pathname === href ? "white" : "#a1a1aa",
                  borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
