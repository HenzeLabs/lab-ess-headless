"use client";
import Link from "next/link";
import { toAppHref } from "@/lib/links";

export type MenuItem = {
  id: string;
  title: string;
  url: string;
  items?: MenuItem[];
};

interface MegaMenuProps {
  items: MenuItem[];
}

export default function MegaMenu({ items }: MegaMenuProps) {
  return (
    <nav className="hidden md:flex h-16 items-center gap-8 relative justify-center">
      {items.map((item) => {
        const hasChildren = item.items && item.items.length > 0;
        return (
          <div
            key={item.id}
            className="relative group h-full flex items-center"
          >
            <Link
              href={toAppHref(item.url)}
              className="text-sm font-medium tracking-tight text-gray-700 hover:text-black px-3 py-1 transition border-b-2 border-transparent group-hover:border-black group-focus-visible:border-black underline-offset-8 focus-visible:outline-none"
            >
              {item.title}
            </Link>
            {hasChildren && item.items && (
              <div className="absolute left-0 right-0 bg-white border-y shadow-xl mt-3 p-8 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto transition-all duration-150 z-40">
                <div
                  className={`grid gap-8 ${
                    (item.items?.length ?? 0) <= 2
                      ? "grid-cols-4 md:grid-cols-3"
                      : "grid-cols-4"
                  }`}
                >
                  {(item.items ?? []).map((child) => (
                    <div key={child.id} className="min-w-[160px]">
                      <div className="font-semibold text-sm mb-2 text-gray-900">
                        {child.title}
                      </div>
                      {child.items && child.items.length > 0 ? (
                        <ul className="space-y-1">
                          {child.items.map((sub) => (
                            <li key={sub.id}>
                              <Link
                                href={toAppHref(sub.url)}
                                className="text-sm text-gray-700 hover:text-black block transition"
                              >
                                {sub.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ))}
                  {/* Feature card placeholder if 1–2 columns only */}
                  {(item.items?.length ?? 0) <= 2 && (
                    <div className="rounded-lg bg-gray-100 h-40 flex items-center justify-center col-span-1">
                      <span className="text-gray-400">Feature image</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
