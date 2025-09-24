'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { textStyles } from '@/lib/ui';
import { AnalyticsTracker } from '@/lib/analytics-tracking-enhanced';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Call the login API endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('Login successful');

        // Track successful login analytics
        const customerId = 'customer_123'; // This would come from the API response in real implementation
        AnalyticsTracker.trackCustomerLogin(customerId, 'email');

        // Redirect to account page
        window.location.href = '/account';
      } else {
        // Track failed login analytics
        AnalyticsTracker.trackLoginFailed('invalid_credentials', 1);

        // Display specific error messages if available
        const errorMessage =
          result.errors && result.errors.length > 0
            ? result.errors
                .map((error: { message: string }) => error.message)
                .join(', ')
            : 'Login failed. Please check your credentials.';
        setError(errorMessage);
      }
    } catch (err) {
      // Track failed login due to error
      AnalyticsTracker.trackLoginFailed('system_error', 1);
      setError('An unexpected error occurred.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      id="main-content"
      className="bg-[hsl(var(--bg))] text-[hsl(var(--ink))] py-12 md:py-16"
    >
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        <div className="max-w-md mx-auto">
          <h1
            className={`${textStyles.h1} text-center mb-8`}
            data-test-id="login-page-title"
          >
            Login
          </h1>
          <div className="bg-[hsl(var(--surface))] p-8 rounded-lg border border-[hsl(var(--border))]/60 shadow-sm">
            <form
              onSubmit={handleSubmit}
              className="space-y-6"
              data-test-id="login-form"
            >
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[hsl(var(--ink))] mb-2"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-[hsl(var(--brand))] focus:border-[hsl(var(--brand))] bg-white text-[hsl(var(--ink))] placeholder:text-gray-500"
                  data-test-id="login-email"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[hsl(var(--ink))] mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-[hsl(var(--brand))] focus:border-[hsl(var(--brand))] bg-white text-[hsl(var(--ink))] placeholder:text-gray-500"
                  data-test-id="login-password"
                />
              </div>

              {error && (
                <p
                  className="text-red-500 text-sm"
                  data-test-id="login-error-message"
                >
                  {error}
                </p>
              )}

              <div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={isLoading}
                  data-test-id="login-submit-button"
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
              Don&apos;t have an account?{' '}
              <Link
                href="/account/register"
                className="font-semibold leading-6 text-[hsl(var(--brand))] hover:text-[hsl(var(--brand-dark))]"
                data-test-id="register-link"
              >
                Register
              </Link>
            </p>
            <p className="mt-2 text-center text-sm text-[hsl(var(--muted-foreground))]">
              <Link
                href="/account/recover"
                className="font-semibold leading-6 text-[hsl(var(--brand))] hover:text-[hsl(var(--brand-dark))]"
                data-test-id="forgot-password-link"
              >
                Forgot password?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
