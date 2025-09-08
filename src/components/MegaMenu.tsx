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
    <nav className="hidden md:flex h-14 items-center gap-6 relative">
      {items.map((item) => {
        const hasChildren = item.items && item.items.length > 0;
        return (
          <div
            key={item.id}
            className="relative group h-full flex items-center"
          >
            <Link
              href={toAppHref(item.url)}
              className="text-sm font-semibold text-gray-800 hover:text-black px-2 py-1 transition border-b-2 border-transparent group-hover:border-black group-focus-within:border-black"
            >
              {item.title}
            </Link>
            {hasChildren && item.items && (
              <div className="absolute left-0 right-0 bg-white shadow-lg border-t mt-2 p-8 hidden group-hover:block group-focus-within:block z-40">
                <div
                  className={`grid gap-8 ${
                    (item.items?.length ?? 0) <= 2
                      ? "grid-cols-3"
                      : "grid-cols-3"
                  }`}
                >
                  {(item.items ?? []).map((child, idx) => (
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
                                className="text-sm text-gray-700 hover:text-black block"
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
