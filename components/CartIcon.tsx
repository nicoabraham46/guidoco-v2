"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

export default function CartIcon() {
  const { totalItems } = useCart();

  // CARRITO DESACTIVADO HASTA ACTIVAR MP
  void totalItems;
  return null;
}
