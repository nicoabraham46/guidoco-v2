"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { sortImages, sanitizeImageUrl } from "@/lib/images";

type GalleryImage = { url: string | null; sort_order: number | null };

export default function ProductGallery({
  images,
  alt,
}: {
  images: GalleryImage[];
  alt: string;
}) {
  const sorted = useMemo(() => sortImages(images ?? []), [images]);
  const urls = useMemo(
    () => sorted.map((img) => sanitizeImageUrl(img.url ?? null)).filter(Boolean) as string[],
    [sorted]
  );

  const [activeUrl, setActiveUrl] = useState<string | null>(urls[0] ?? null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      const currentIndex = urls.indexOf(activeUrl ?? "");
      if (diff > 0 && currentIndex < urls.length - 1) {
        setActiveUrl(urls[currentIndex + 1]);
      } else if (diff < 0 && currentIndex > 0) {
        setActiveUrl(urls[currentIndex - 1]);
      }
    }
    touchStartX.current = null;
  };

  // ── Cierre con Escape ─────────────────────────────────────────────────────
  useEffect(() => {
    if (lightboxIndex === null) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") setLightboxIndex((i) => (i === null ? null : (i + 1) % urls.length));
      if (e.key === "ArrowLeft") setLightboxIndex((i) => (i === null ? null : (i - 1 + urls.length) % urls.length));
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxIndex, urls.length]);

  // ── Bloquear scroll del body cuando el lightbox está abierto ─────────────
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [lightboxIndex]);

  function openLightbox(url: string) {
    const idx = urls.indexOf(url);
    if (idx !== -1) setLightboxIndex(idx);
  }

  function prev() {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + urls.length) % urls.length));
  }

  function next() {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % urls.length));
  }

  return (
    <>
      {/* ── Galería ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">

        {/* Imagen principal */}
        <div
          className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: "pan-y" }}
        >
          {activeUrl ? (
            <button
              type="button"
              onClick={() => openLightbox(activeUrl)}
              className="group relative block w-full cursor-zoom-in"
              aria-label="Ver imagen ampliada"
            >
              <Image
                src={activeUrl}
                alt={alt}
                width={900}
                height={675}
                className="aspect-[4/3] w-full object-cover"
                priority
              />
              {/* Hint de zoom */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <div className="rounded-full bg-black/50 p-2.5 backdrop-blur-sm">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                    />
                  </svg>
                </div>
              </div>
            </button>
          ) : (
            <div className="aspect-[4/3] w-full flex items-center justify-center bg-zinc-800">
              <svg
                className="h-16 w-16 text-zinc-700"
                fill="none"
                stroke="currentColor"
                strokeWidth={0.8}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {urls.length > 1 && (
          <div className="grid grid-cols-6 gap-2">
            {urls.slice(0, 12).map((url, idx) => {
              const isActive = url === activeUrl;
              return (
                <button
                  key={`${url}-${idx}`}
                  type="button"
                  onClick={() => setActiveUrl(url)}
                  className={`overflow-hidden rounded-lg border transition-all duration-150 ${
                    isActive
                      ? "border-white ring-1 ring-white"
                      : "border-zinc-700 opacity-60 hover:border-zinc-400 hover:opacity-100"
                  }`}
                  aria-label={`Ver imagen ${idx + 1}`}
                >
                  <Image
                    src={url}
                    alt={`${alt} ${idx + 1}`}
                    width={120}
                    height={120}
                    className="aspect-square w-full object-cover"
                  />
                </button>
              );
            })}
          </div>
        )}

      </div>

      {/* ── Lightbox ────────────────────────────────────────────────────── */}
      {lightboxIndex !== null && urls[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Contenedor imagen — detiene propagación para no cerrar al click sobre la imagen */}
          <div
            className="relative flex h-full w-full max-w-5xl items-center justify-center px-16 py-12"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={urls[lightboxIndex]}
              alt={alt}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 80vw"
              priority
            />
          </div>

          {/* Botón cerrar */}
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Cerrar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Flechas de navegación (solo si hay más de una imagen) */}
          {urls.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label="Imagen anterior"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </button>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label="Imagen siguiente"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>

              {/* Contador */}
              <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white/70 backdrop-blur-sm">
                {lightboxIndex + 1} / {urls.length}
              </p>
            </>
          )}
        </div>
      )}
    </>
  );
}
