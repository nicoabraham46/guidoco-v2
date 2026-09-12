"use client";

import { useState } from "react";
import PokemonTypeDropdown from "@/components/PokemonTypeDropdown";

export default function PokemonTypeSelect({ defaultValue = "" }: { defaultValue?: string }) {
  const [selected, setSelected] = useState(defaultValue);

  return (
    <>
      <input type="hidden" name="pokemon_type" value={selected} />
      <PokemonTypeDropdown value={selected} onChange={setSelected} placeholder="Sin tipo" />
    </>
  );
}
