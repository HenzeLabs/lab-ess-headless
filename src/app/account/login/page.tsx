'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { textStyles } from '@/lib/ui';

type FormState = 'idle' | 'submitting';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/account';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (formState === 'submitting') {
      return;
    }

    if (!email || !password) {
      setErrorMessage('Enter both email and password to continue.');
      return;
    }

    setFormState('submitting');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        if (response.status === 429) {
          setErrorMessage(
            data?.error ??
              'Too many attempts. Please wait a few minutes and try again.',
          );
        } else {
          const details =
            typeof data?.error === 'string'
              ? data.error
              : 'Invalid email or password.';
          setErrorMessage(details);
        }
        return;
      }

      const data = (await response.json()) as {
        accessToken?: string;
        user?: { email: string };
      };

      if (data.accessToken) {
        try {
          window.localStorage.setItem('accessToken', data.accessToken);
        } catch (storageError) {
          console.warn('Unable to persist access token', storageError);
        }
      }

      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      console.error('Login request failed', error);
      setErrorMessage('Unable to log in right now. Please try again.');
    } finally {
      setFormState('idle');
    }
  };

  return (
    <main
      id='main-content'
      className='bg-[hsl(var(--bg))] text-[hsl(var(--ink))] py-12 md:py-16'
    >
      <div className='mx-auto w-full max-w-6xl px-6 md:px-10'>
        <div className='max-w-md mx-auto'>
          <h1
            className={`${textStyles.h1} text-center mb-8`}
            data-test-id='login-page-title'
          >
            Login
          </h1>
          <div className='bg-[hsl(var(--surface))] p-8 rounded-lg border border-[hsl(var(--border))]/60 shadow-sm'>
            <form
              onSubmit={handleSubmit}
              className='space-y-6'
              data-test-id='login-form'
            >
              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium text-[hsl(var(--ink))] mb-2'
                >
                  Email address
                </label>
                <input
                  id='email'
                  name='email'
                  type='email'
                  autoComplete='email'
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className='block w-full rounded-md px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-[hsl(var(--brand))] focus:border-[hsl(var(--brand))] bg-white text-[hsl(var(--ink))] placeholder:text-gray-500'
                  data-test-id='login-email'
                />
              </div>

              <div>
                <label
                  htmlFor='password'
                  className='block text-sm font-medium text-[hsl(var(--ink))] mb-2'
                >
                  Password
                </label>
                <input
                  id='password'
                  name='password'
                  type='password'
                  autoComplete='current-password'
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className='block w-full rounded-md px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-[hsl(var(--brand))] focus:border-[hsl(var(--brand))] bg-white text-[hsl(var(--ink))] placeholder:text-gray-500'
                  data-test-id='login-password'
                />
              </div>

              {errorMessage ? (
                <p
                  className='text-red-600 text-sm'
                  data-test-id='login-error-message'
                  role='alert'
                >
                  {errorMessage}
                </p>
              ) : null}

              <div>
                <Button
                  type='submit'
                  variant='primary'
                  className='w-full'
                  disabled={formState === 'submitting'}
                  data-test-id='login-submit-button'
                >
                  {formState === 'submitting' ? 'Logging in...' : 'Login'}
                </Button>
              </div>
            </form>

            <p className='mt-6 text-center text-sm text-[hsl(var(--muted-foreground))]'>
              Do not have an account?{' '}
              <Link
                href='/account/register'
                className='font-semibold leading-6 text-[hsl(var(--brand))] hover:text-[hsl(var(--brand-dark))]'
                data-test-id='register-link'
              >
                Register
              </Link>
            </p>
            <p className='mt-2 text-center text-sm text-[hsl(var(--muted-foreground))]'>
              <Link
                href='/account/recover'
                className='font-semibold leading-6 text-[hsl(var(--brand))] hover:text-[hsl(var(--brand-dark))]'
                data-test-id='forgot-password-link'
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
