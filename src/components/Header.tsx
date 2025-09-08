"use client";
import { useEffect, useState } from "react";
import MegaMenu, { MenuItem } from "./MegaMenu";
import MobileMenu from "./MobileMenu";

export default function Header() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch("/api/menu")
      .then((res) => res.json())
      .then((data) => setMenu(data.items || []));
  }, []);

  return (
    <header className="w-full border-b bg-white sticky top-0 z-30 shadow-sm h-14 flex items-center">
      <div className="max-w-5xl mx-auto flex items-center justify-between w-full px-6">
        <a
          href="/"
          className="text-xl font-bold tracking-tight text-gray-900 hover:text-blue-600 transition"
        >
          Lab Essentials
        </a>
        <div className="flex items-center gap-4">
          <button
            className="md:hidden p-2 text-gray-700"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span className="text-2xl">☰</span>
          </button>
          <MegaMenu items={menu} />
        </div>
      </div>
      {mobileOpen && (
        <MobileMenu items={menu} onClose={() => setMobileOpen(false)} />
      )}
    </header>
  );
}
