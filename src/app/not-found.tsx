import Link from 'next/link';
import { AnimationWrapper, ScrollAnimation } from '@/components/ui/animations';
import { buttonStyles } from '@/lib/ui';

export default async function NotFound() {
  return (
    <main
      role="main"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 px-4 relative overflow-hidden"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-xl animate-float animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-indigo-500/20 rounded-full mix-blend-multiply filter blur-xl animate-float animation-delay-4000"></div>
      </div>

      <div className="max-w-2xl w-full text-center relative z-10">
        <AnimationWrapper className="mb-8">
          <div className="relative">
            {/* 404 Animation */}
            <div className="text-9xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent mb-4 animate-glow">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10">
                <svg
                  className="w-20 h-20 text-white animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </AnimationWrapper>

        <ScrollAnimation className="mb-8">
          <h1
            className="text-5xl font-bold text-white mb-6 animate-fade-in-up"
            data-test-id="error-message"
          >
            Lost in the Lab?
          </h1>

          <p className="text-xl text-white/80 leading-relaxed mb-8 animate-fade-in-up animation-delay-500">
            Don&apos;t worry! Even the best scientists sometimes take a wrong
            turn. Let&apos;s get you back to discovering amazing lab equipment.
          </p>
        </ScrollAnimation>

        <ScrollAnimation className="space-y-4 mb-8">
          <Link
            href="/"
            className={`${buttonStyles.primary} w-full inline-block`}
          >
            Back to Homepage
          </Link>

          <Link
            href="/collections"
            className={`${buttonStyles.outline} w-full inline-block`}
          >
            Browse Products
          </Link>
        </ScrollAnimation>

        <ScrollAnimation>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3">
              What can you do?
            </h3>
            <ul className="text-left text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Check the URL for typos
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Use the search function to find what you need
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Browse our product collections
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Contact support if you think this is an error
              </li>
            </ul>
          </div>
        </ScrollAnimation>

        {/* Popular Links */}
        <ScrollAnimation className="mt-8">
          <div className="text-sm text-gray-500">
            <p className="mb-3">Popular pages:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/collections"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                All Products
              </Link>
              <Link
                href="/about"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </ScrollAnimation>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-100 rounded-full opacity-20"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-indigo-100 rounded-full opacity-20"></div>
      </div>
    </main>
  );
}
