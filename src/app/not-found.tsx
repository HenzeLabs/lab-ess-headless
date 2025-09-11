import Link from 'next/link';

export default async function NotFound() {
  return (
    <main
      role="main"
      className="flex items-center justify-center min-h-screen bg-background"
    >
      <div className="text-center">
        <h1 className="text-6xl font-bold text-foreground">404</h1>
        <p className="text-2xl font-light text-muted-foreground mb-4">
          Page Not Found
        </p>
        <p className="text-muted-foreground mb-8">
          Sorry, the page you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Go back to homepage
        </Link>
      </div>
    </main>
  );
}
