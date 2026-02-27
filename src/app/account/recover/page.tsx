'use client';

import { useState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { textStyles } from '@/lib/ui';

type FormState = 'idle' | 'submitting' | 'success';

export default function AccountRecoverPage() {
  const [email, setEmail] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email || formState === 'submitting') {
      return;
    }

    setFormState('submitting');
    setMessage(null);

    try {
      const response = await fetch('/api/auth/recover', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const error =
          typeof data?.error === 'string'
            ? data.error
            : 'We could not send reset instructions. Please try again.';
        setMessage(error);
        setFormState('idle');
        return;
      }

      const data = await response.json().catch(() => null);
      const successMessage =
        typeof data?.message === 'string'
          ? data.message
          : 'If the email is registered we will send reset instructions shortly.';

      setFormState('success');
      setMessage(successMessage);
    } catch (error) {
      console.error('Password recovery failed', error);
      setMessage('We could not send reset instructions. Please try again.');
      setFormState('idle');
    }
  };

  return (
    <main className='bg-[hsl(var(--bg))] text-[hsl(var(--ink))] py-12 md:py-16'>
      <div className='mx-auto w-full max-w-6xl px-6 md:px-10'>
        <div className='mx-auto max-w-lg'>
          <h1 className={`${textStyles.h1} mb-6 text-center`}>Reset password</h1>
          <div className='rounded-xl border border-[hsl(var(--border))]/60 bg-[hsl(var(--surface))] p-8 shadow-sm'>
            <p className='text-sm text-[hsl(var(--muted-foreground))]'>
              Enter the email address used on your account. We will send a link with next
              steps if the account exists.
            </p>

            <form onSubmit={handleSubmit} className='mt-6 space-y-5'>
              <div>
                <label
                  htmlFor='recovery-email'
                  className='mb-2 block text-sm font-medium text-[hsl(var(--ink))]'
                >
                  Email address
                </label>
                <input
                  id='recovery-email'
                  type='email'
                  required
                  autoComplete='email'
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className='block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-[hsl(var(--ink))] placeholder:text-gray-500 focus:border-[hsl(var(--brand))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand))]'
                />
              </div>

              {message ? (
                <div
                  className={`rounded-md border px-3 py-2 text-sm ${
                    formState === 'success'
                      ? 'border-green-200 bg-green-50 text-green-700'
                      : 'border-red-200 bg-red-50 text-red-700'
                  }`}
                  role='status'
                >
                  {message}
                </div>
              ) : null}

              <Button
                type='submit'
                className='w-full'
                disabled={formState === 'submitting'}
              >
                {formState === 'submitting' ? 'Sending...' : 'Send reset link'}
              </Button>
            </form>

            <div className='mt-6 text-center text-sm text-[hsl(var(--muted-foreground))]'>
              <Link
                href='/account/login'
                className='font-semibold text-[hsl(var(--brand))] hover:text-[hsl(var(--brand-dark))]'
              >
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
