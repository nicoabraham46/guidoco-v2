"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

type AddToCartButtonProps = {
  productId: string;
  name: string;
  price: number;
  imageUrl: string | null;
};

export default function AddToCartButton({
  productId,
  name,
  price,
  imageUrl,
}: AddToCartButtonProps) {
  const { addItem, items } = useCart();
  const [added, setAdded] = useState(false);

  const inCart = items.some((i) => i.product_id === productId);

  function handleAdd() {
    addItem({ product_id: productId, name, price, image_url: imageUrl });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  // Color del botón principal
  const btnBg = added ? "#C0392B" : inCart ? "#C0392B" : "#1a1a1a";
  const btnHover = added ? "" : inCart ? "hover:opacity-90" : "hover:bg-[#333]";

  return (
    <div className="space-y-2">
      <button
        onClick={handleAdd}
        disabled={added}
        className={`flex w-full items-center justify-center gap-2 rounded-lg text-[15px] font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${btnHover}`}
        style={{ backgroundColor: btnBg, height: "52px" }}
      >
        {added ? (
          <>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            ¡Agregado al carrito!
          </>
        ) : (
          <>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
            {inCart ? "Agregar de nuevo" : "Agregar al carrito"}
          </>
        )}
      </button>

      {inCart && (
        <Link
          href="/carrito"
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border text-[15px] font-semibold text-[#1a1a1a] transition-colors hover:bg-[#f5f5f5]"
          style={{ borderWidth: "1.5px", borderColor: "#1a1a1a", height: "52px" }}
        >
          Ver carrito →
        </Link>
      )}
    </div>
  );
}
