"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavInicio({ className }: { className?: string }) {
  const pathname = usePathname();

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <Link href="/" className={className} onClick={handleClick}>
      Inicio
    </Link>
  );
}
