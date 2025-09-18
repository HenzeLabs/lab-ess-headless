export default function StyleGuidePage() {
  return (
    <main
      id="main-content"
      className="container mx-auto px-4 lg:px-8 py-12 space-y-8 lg:space-y-12"
    >
      <h1 className="text-3xl font-bold mb-6">Style Guide</h1>
      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Design Tokens</h2>
        <p className="text-[hsl(var(--muted))] max-w-2xl">
          The design system documentation is being consolidated. Check back soon
          for updated guidance on color, typography, and component usage.
        </p>
      </section>
    </main>
  );
}
