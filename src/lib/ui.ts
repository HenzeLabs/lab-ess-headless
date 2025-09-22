export const layout = {
  container: 'mx-auto w-full max-w-6xl px-6 md:px-10',
  section: 'py-12 md:py-16',
  center: 'flex items-center justify-center',
};

export const buttonStyles = {
  primary:
    'inline-flex items-center justify-center gap-2 rounded-xl bg-[hsl(var(--brand))] px-4 py-2 text-sm font-semibold text-white shadow-subtle transition-all duration-200 ease-out-soft hover:-translate-y-[1px] hover:bg-[hsl(var(--brand-dark))] hover:text-white hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]',
  accent:
    'inline-flex items-center justify-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-4 py-2 text-sm font-semibold text-white shadow-lift transition-all duration-200 ease-out-soft hover:-translate-y-[1px] hover:bg-[hsl(var(--accent-dark))] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]',
  ghost:
    'inline-flex items-center justify-center gap-2 rounded-xl border border-transparent px-4 py-2 text-sm font-semibold text-heading transition-all duration-200 ease-out-soft hover:-translate-y-[1px] hover:bg-[hsl(var(--muted))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]',
  outline:
    'inline-flex items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-surface px-4 py-2 text-sm font-semibold text-heading transition-all duration-200 ease-out-soft hover:-translate-y-[1px] hover:border-[hsl(var(--brand))] hover:bg-[hsl(var(--muted))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]',
  link: 'inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--brand))] underline underline-offset-4 transition-colors duration-200 hover:text-[hsl(var(--brand-dark))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]',
};

export const textStyles = {
  // Headings - all use font-bold, tracking-tight, responsive sizes
  h1: 'text-3xl font-bold tracking-tight text-[hsl(var(--ink))] lg:text-4xl xl:text-5xl',
  h2: 'text-2xl font-bold tracking-tight text-[hsl(var(--ink))] md:text-3xl lg:text-4xl',
  h3: 'text-xl font-bold tracking-tight text-[hsl(var(--ink))] md:text-2xl',
  h4: 'text-lg font-bold tracking-tight text-[hsl(var(--ink))] md:text-xl',
  h5: 'text-base font-bold tracking-tight text-[hsl(var(--ink))] md:text-lg',
  h6: 'text-sm font-bold tracking-tight text-[hsl(var(--ink))] md:text-base',

  // Body text - all use font-normal, leading-relaxed
  body: 'text-base font-normal leading-relaxed text-[hsl(var(--ink))]',
  bodyLarge: 'text-lg font-normal leading-relaxed text-[hsl(var(--ink))]',
  bodySmall: 'text-sm font-normal leading-relaxed text-[hsl(var(--muted))]',
  caption: 'text-xs font-normal leading-relaxed text-[hsl(var(--muted))]',

  // Legacy styles for backward compatibility
  heading:
    'text-3xl font-bold tracking-tight text-[hsl(var(--ink))] sm:text-[2.5rem]',
  subheading:
    'text-base font-normal leading-relaxed text-[hsl(var(--muted))] sm:text-lg',
};
