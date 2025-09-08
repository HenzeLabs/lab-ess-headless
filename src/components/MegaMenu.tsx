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
              className="text-sm text-gray-700 hover:text-black px-2 py-1 transition border-b-2 border-transparent group-hover:border-black group-focus-within:border-black"
            >
              {item.title}
            </Link>
            {hasChildren && (
              <div className="absolute left-0 right-0 bg-white shadow-lg border-t mt-2 p-6 hidden group-hover:block group-focus-within:block z-40 min-w-[200px]">
                <div className="grid grid-cols-2 gap-6">
                  {item.items?.map((child) => (
                    <div key={child.id}>
                      <Link
                        href={toAppHref(child.url)}
                        className="text-sm text-gray-700 hover:text-black block py-1"
                      >
                        {child.title}
                      </Link>
                      {child.items && child.items.length > 0 && (
                        <div className="pl-2 mt-1 space-y-1">
                          {child.items.map((sub) => (
                            <Link
                              key={sub.id}
                              href={toAppHref(sub.url)}
                              className="text-sm text-gray-600 hover:text-black block"
                            >
                              {sub.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
