import Link from 'next/link';
import { textStyles } from '@/lib/ui';

export default async function NotFound() {
  return (
    <main
      role="main"
      className="flex items-center justify-center min-h-screen bg-background"
    >
      <div className="text-center">
        <h1 className={`${textStyles.h1} text-6xl`}>404</h1>
        <p
          className={`${textStyles.bodyLarge} mb-4`}
          data-test-id="error-message"
        >
          Page Not Found
        </p>
        <p className={`${textStyles.body} mb-8`}>
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
