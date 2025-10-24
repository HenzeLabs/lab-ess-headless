import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

type BreadcrumbItem = {
  label: string;
  href: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-2 text-sm ${className}`}
    >
      <ol className="flex items-center gap-2 flex-wrap">
        {/* Home */}
        <li>
          <Link
            href="/"
            className="flex items-center gap-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--brand))] transition-colors"
            aria-label="Home"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {/* Breadcrumb items */}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.href} className="flex items-center gap-2">
              <ChevronRight
                className="h-4 w-4 text-[hsl(var(--muted-foreground))]"
                aria-hidden="true"
              />
              {isLast ? (
                <span
                  className="font-medium text-[hsl(var(--ink))]"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--brand))] transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
