import { redirect } from "next/navigation";

// CARRITO DESACTIVADO HASTA ACTIVAR MP — eliminar este redirect cuando se active
export default function CarritoPage() {
  redirect("/catalogo");
}
