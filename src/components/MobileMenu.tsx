"use client";
import Link from "next/link";
import { useState } from "react";
import { toAppHref } from "@/lib/links";
import type { MenuItem } from "./MegaMenu";

interface MobileMenuProps {
  items: MenuItem[];
  onClose?: () => void;
}

export default function MobileMenu({ items, onClose }: MobileMenuProps) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <nav className="md:hidden bg-white border-t shadow-lg p-4">
      <ul className="space-y-2">
        {items.map((item) => {
          const hasChildren = item.items && item.items.length > 0;
          return (
            <li key={item.id}>
              <div className="flex items-center justify-between">
                <Link
                  href={toAppHref(item.url)}
                  className="text-base text-gray-700 hover:text-black font-medium py-2 block transition"
                  onClick={onClose}
                >
                  {item.title}
                </Link>
                {hasChildren && (
                  <button
                    className="ml-2 text-gray-500"
                    onClick={() => setOpen(open === item.id ? null : item.id)}
                    aria-label={open === item.id ? "Collapse" : "Expand"}
                  >
                    <span>{open === item.id ? "−" : "+"}</span>
                  </button>
                )}
              </div>
              {hasChildren && open === item.id && (
                <ul className="pl-4 mt-1 space-y-1">
                  {item.items?.map((child) => (
                    <li key={child.id}>
                      <Link
                        href={toAppHref(child.url)}
                        className="text-sm text-gray-700 hover:text-black py-1 block transition"
                        onClick={onClose}
                      >
                        {child.title}
                      </Link>
                      {child.items && child.items.length > 0 && (
                        <ul className="pl-4 mt-1 space-y-1">
                          {child.items.map((sub) => (
                            <li key={sub.id}>
                              <Link
                                href={toAppHref(sub.url)}
                                className="text-sm text-gray-600 hover:text-black py-1 block transition"
                                onClick={onClose}
                              >
                                {sub.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
