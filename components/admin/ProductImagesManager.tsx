"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { sanitizeImageUrl } from "@/lib/images";

type ProductImage = {
  id: string;
  url: string | null;
  sort_order: number | null;
};

export default function ProductImagesManager({
  productId,
  initialImages,
}: {
  productId: string;
  initialImages: ProductImage[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<ProductImage[]>(
    [...initialImages].sort((a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99))
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);

    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append("file", file);
      form.append("productId", productId);

      const res = await fetch("/api/admin/images", { method: "POST", body: form });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Error al subir imagen");
        break;
      }

      setImages((prev) =>
        [...prev, json.image as ProductImage].sort(
          (a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99)
        )
      );
    }

    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    startTransition(() => router.refresh());
  }

  async function handleDelete(imageId: string, url: string | null) {
    if (!confirm("¿Eliminar esta imagen?")) return;
    setError(null);

    const res = await fetch("/api/admin/images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", imageId, url }),
    });
    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? "Error al eliminar");
      return;
    }

    setImages((prev) => prev.filter((img) => img.id !== imageId));
    startTransition(() => router.refresh());
  }

  async function handleSetCover(imageId: string) {
    setError(null);

    const res = await fetch("/api/admin/images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cover", productId, imageId }),
    });
    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? "Error al establecer portada");
      return;
    }

    // Reorder local state
    setImages((prev) => {
      const target = prev.find((img) => img.id === imageId);
      const others = prev.filter((img) => img.id !== imageId);
      if (!target) return prev;
      return [
        { ...target, sort_order: 0 },
        ...others.map((img, i) => ({ ...img, sort_order: i + 1 })),
      ];
    });
    startTransition(() => router.refresh());
  }

  const isCover = (img: ProductImage) => img.sort_order === 0 || images.indexOf(img) === 0;

  return (
    <div className="mt-8 border-t pt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Imágenes del producto</h2>

        <label
          className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${
            uploading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"
          }`}
        >
          {uploading ? "Subiendo…" : "+ Subir imagen(es)"}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={handleUpload}
          />
        </label>
      </div>

      {error && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {images.length === 0 ? (
        <p className="mt-4 text-sm text-gray-400">
          No hay imágenes todavía. Sube la primera.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img) => {
            const url = sanitizeImageUrl(img.url ?? null);
            const cover = isCover(img);

            return (
              <div
                key={img.id}
                className={`group relative overflow-hidden rounded-xl border-2 transition-colors ${
                  cover ? "border-black" : "border-gray-200"
                }`}
              >
                {/* Image */}
                <div className="aspect-square w-full bg-gray-100">
                  {url ? (
                    <Image
                      src={url}
                      alt="product image"
                      width={240}
                      height={240}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      Sin URL
                    </div>
                  )}
                </div>

                {/* Cover badge */}
                {cover && (
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Portada
                  </span>
                )}

                {/* Actions overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                  {!cover && (
                    <button
                      onClick={() => handleSetCover(img.id)}
                      disabled={isPending}
                      className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-gray-100 disabled:opacity-60"
                    >
                      Hacer portada
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(img.id, img.url)}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
