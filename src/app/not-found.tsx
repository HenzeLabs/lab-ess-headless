import Link from 'next/link';

export default async function NotFound() {
  return (
    <html lang="en">
      <body>
        <main
          role="main"
          className="flex items-center justify-center min-h-screen bg-gray-100"
        >
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-800">404</h1>
            <p className="text-2xl font-light text-gray-600 mb-4">
              Page Not Found
            </p>
            <p className="text-gray-500 mb-8">
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
      </body>
    </html>
  );
}
