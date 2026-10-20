"use client";

import { useEffect, useState } from "react";
import Tombol from "@/components/Tombol";

export default function ThemeToggle() {
  const [gelap, setGelap] = useState(false);

  useEffect(() => {
    setGelap(document.documentElement.classList.contains("dark"));
  }, []);

  function gantiTema() {
    const temaBaru = !gelap;
    setGelap(temaBaru);
    document.documentElement.classList.toggle("dark", temaBaru);

    try {
      localStorage.setItem("tema", temaBaru ? "gelap" : "terang");
    } catch {
      // Tema tetap berlaku untuk halaman ini walau localStorage tidak tersedia.
    }
  }

  return (
    <Tombol
      type="button"
      varian="garis"
      onClick={gantiTema}
      aria-pressed={gelap}
      aria-label={gelap ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      className="px-3 py-2"
    >
      {gelap ? "Mode terang" : "Mode gelap"}
    </Tombol>
  );
}
