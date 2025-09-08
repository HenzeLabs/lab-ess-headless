"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface NavLinkProps {
  href: string;
  children: ReactNode;
}

export default function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== "/" && pathname.startsWith(href));
  const base = "text-sm transition-colors hover:text-black";
  const active = "text-black font-medium underline underline-offset-4";
  const inactive = "text-gray-700";
  return (
    <Link
      href={href}
      className={`${base} ${isActive ? active : inactive}`}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
