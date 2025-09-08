"use client";
import { useEffect, useState } from "react";
import MegaMenu, { MenuItem } from "./MegaMenu";
import { toAppHref } from "@/lib/links";
import MobileMenu from "./MobileMenu";

export default function Header() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch("/api/menu")
      .then((res) => res.json())
      .then((data) => setMenu(data.items || []))
      .catch(() => {
        setMenu([
          { id: "home", title: "Home", url: "/" },
          {
            id: "microscopes",
            title: "Microscopes",
            url: "/collections/microscopes",
          },
          {
            id: "centrifuges",
            title: "Centrifuges",
            url: "/collections/centrifuges",
          },
          {
            id: "accessories",
            title: "Accessories",
            url: "/collections/accessories",
          },
          { id: "about", title: "About", url: "/about" },
          { id: "contact", title: "Contact", url: "/contact" },
        ]);
      });
  }, []);

  return (
    <header className="w-full border-b bg-white sticky top-0 z-30 shadow-sm h-16 flex items-center">
      <div className="mx-auto max-w-7xl w-full flex items-center justify-between px-6 h-16">
        {/* Logo left */}
        <a
          href="/"
          className="text-xl font-bold tracking-tight text-gray-900 hover:text-blue-600 transition"
        >
          Lab Essentials
        </a>

        {/* Centered nav (desktop only) */}
        <div className="hidden md:flex flex-1 justify-center">
          <MegaMenu items={menu} />
        </div>

        {/* Utility links right */}
        <div className="flex items-center gap-6">
          <a
            href="#"
            className="flex items-center gap-1 text-sm text-gray-700 hover:text-black transition"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              search
            </span>
            <span className="hidden sm:inline">Search</span>
          </a>
          <a
            href="/cart"
            className="flex items-center gap-1 text-sm text-gray-700 hover:text-black transition"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              shopping_bag
            </span>
            <span className="hidden sm:inline">Cart</span>
          </a>
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-700"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span className="text-2xl">☰</span>
          </button>
        </div>
      </div>
      {/* Mobile menu overlay */}
      {mobileOpen && (
        <MobileMenu items={menu} onClose={() => setMobileOpen(false)} />
      )}
    </header>
  );
}
