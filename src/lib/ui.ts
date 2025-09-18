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
  link:
    'inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--brand))] underline underline-offset-4 transition-colors duration-200 hover:text-[hsl(var(--brand-dark))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]',
};

export const textStyles = {
  heading: 'text-3xl font-semibold leading-tight text-heading sm:text-[2.5rem]',
  subheading: 'text-base font-medium text-body/80 sm:text-lg',
};
