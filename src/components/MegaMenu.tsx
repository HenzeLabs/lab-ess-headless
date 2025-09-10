import { useEffect, useState, useRef } from "react";
import Link from "next/link";

export type MegaMenuItem = {
  id: string;
  title: string;
  url: string;
  items?: MegaMenuItem[];
};

export default function MegaMenu() {
  const [menu, setMenu] = useState<MegaMenuItem[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/menu")
      .then((res) => res.json())
      .then((data) => setMenu(data.items || []));
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenIndex(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!menu.length) return null;

  return (
    <div ref={menuRef} className="relative z-50">
      <ul className="flex gap-4 items-center justify-center px-2">
        {menu.map((item, idx) => (
          <li key={item.id} className="relative group">
            <button
              className={`px-4 py-2 rounded-full font-semibold text-koala-dark-grey bg-transparent hover:bg-koala-pale-green focus:outline-none focus:ring-2 focus:ring-koala-green/40 flex items-center gap-1 whitespace-nowrap text-sm uppercase tracking-wider transition-all duration-150 ${
                openIndex === idx ? "ring-2 ring-koala-green/30" : ""
              }`}
              onMouseEnter={() => setOpenIndex(idx)}
              onMouseLeave={() => setOpenIndex(null)}
              onFocus={() => setOpenIndex(idx)}
              onBlur={() => setOpenIndex(null)}
              aria-haspopup={!!item.items?.length}
              aria-expanded={openIndex === idx}
            >
              {item.title}
              {item.items?.length ? (
                <svg
                  className="w-4 h-4 ml-1 text-koala-green"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              ) : null}
            </button>
            {item.items?.length ? (
              <div
                className={`absolute left-1/2 -translate-x-1/2 top-full w-[700px] bg-white shadow-lg rounded-2xl border border-gray-200 mt-4 p-8 flex transition-all duration-200 ${
                  openIndex === idx
                    ? "opacity-100 visible pointer-events-auto"
                    : "opacity-0 invisible pointer-events-none"
                }`}
                onMouseEnter={() => setOpenIndex(idx)}
                onMouseLeave={() => setOpenIndex(null)}
              >
                {/* Main Columns */}
                <div className="flex-1 grid grid-cols-2 gap-8 pr-8 border-r border-gray-200/60">
                  {item.items.map((sub) => (
                    <div key={sub.id}>
                      <div className="mb-2 text-xs font-bold text-koala-dark-grey uppercase tracking-wider flex items-center gap-2">
                        <span className="inline-block w-4 h-4 bg-koala-green/10 rounded mr-1" />
                        {sub.title}
                      </div>
                      {sub.items?.length ? (
                        <ul className="space-y-1">
                          {sub.items.map((leaf) => (
                            <li key={leaf.id}>
                              <Link
                                href={leaf.url}
                                className="block whitespace-nowrap px-3 py-2 text-koala-dark-grey hover:bg-koala-pale-green hover:text-koala-green rounded-md transition-colors font-medium"
                                prefetch={false}
                              >
                                {leaf.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ))}
                </div>
                {/* Right: Optionally add promo or image here */}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
