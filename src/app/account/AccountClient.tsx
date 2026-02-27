'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { textStyles, buttonStyles } from '@/lib/ui';

type AuthState =
  | { status: 'loading' }
  | { status: 'guest' }
  | { status: 'authenticated'; email: string };

interface AccountClientProps {
  hasRefreshToken: boolean;
}

async function refreshAccessToken() {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { accessToken?: string };

    if (data.accessToken) {
      try {
        window.localStorage.setItem('accessToken', data.accessToken);
      } catch (error) {
        console.warn('Unable to store refreshed access token', error);
      }
    }

    return data.accessToken ?? null;
  } catch (error) {
    console.error('Refresh token request failed', error);
    return null;
  }
}

export default function AccountClient({ hasRefreshToken }: AccountClientProps) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({ status: 'loading' });

  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      let accessToken: string | null = null;

      try {
        accessToken = window.localStorage.getItem('accessToken');
      } catch (error) {
        console.warn('Unable to read stored access token', error);
      }

      if (!accessToken && hasRefreshToken) {
        accessToken = await refreshAccessToken();
      }

      if (!accessToken) {
        if (isMounted) {
          setState({ status: 'guest' });
        }
        return;
      }

      try {
        const verifyResponse = await fetch('/api/auth/verify', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (verifyResponse.ok) {
          const data = (await verifyResponse.json()) as {
            user?: { email: string };
          };
          if (isMounted) {
            setState({
              status: 'authenticated',
              email: data.user?.email ?? '',
            });
          }
          return;
        }

        // Token might be expired. Try a refresh once.
        if (hasRefreshToken) {
          const refreshedToken = await refreshAccessToken();
          if (refreshedToken) {
            const retryResponse = await fetch('/api/auth/verify', {
              headers: {
                Authorization: `Bearer ${refreshedToken}`,
              },
            });

            if (retryResponse.ok) {
              const data = (await retryResponse.json()) as {
                user?: { email: string };
              };
              if (isMounted) {
                setState({
                  status: 'authenticated',
                  email: data.user?.email ?? '',
                });
              }
              return;
            }
          }
        }
      } catch (error) {
        console.error('Account verification failed', error);
      }

      // If we reach here we could not verify the session
      try {
        window.localStorage.removeItem('accessToken');
      } catch (error) {
        console.warn('Unable to remove access token', error);
      }
      if (isMounted) {
        setState({ status: 'guest' });
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [hasRefreshToken]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout request failed', error);
    }

    try {
      window.localStorage.removeItem('accessToken');
    } catch (error) {
      console.warn('Unable to clear access token', error);
    }

    setState({ status: 'guest' });
    router.refresh();
  };

  if (state.status === 'loading') {
    return (
      <div className='flex min-h-[320px] items-center justify-center'>
        <div className='flex flex-col items-center gap-3 text-center'>
          <div className='h-10 w-10 animate-spin rounded-full border-2 border-[hsl(var(--brand))]/20 border-t-[hsl(var(--brand))]' />
          <p className='text-sm text-[hsl(var(--muted-foreground))]'>
            Checking your account...
          </p>
        </div>
      </div>
    );
  }

  if (state.status === 'guest') {
    return (
      <div className='mx-auto max-w-xl rounded-2xl border border-border/60 bg-white p-10 text-center shadow-md'>
        <h1 className={`${textStyles.h2} mb-4 text-[hsl(var(--ink))]`}>
          Sign in to manage your orders
        </h1>
        <p className='text-sm text-[hsl(var(--muted-foreground))]'>
          Save carts, check order confirmations, and download invoices once you are
          signed in.
        </p>
        <div className='mt-6 flex flex-col items-center gap-3'>
          <Link href='/account/login' className={buttonStyles.primary}>
            Go to login
          </Link>
          <Link
            href='/account/register'
            className='text-sm font-semibold text-[hsl(var(--brand))] hover:text-[hsl(var(--brand-dark))]'
          >
            Create an account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      <header className='rounded-xl border border-border/60 bg-white p-6 shadow-sm'>
        <p className='text-xs font-semibold uppercase tracking-[0.3em] text-[hsl(var(--brand))]'>
          Welcome back
        </p>
        <h1 className={`${textStyles.h1} mt-3 text-[hsl(var(--ink))]`}>
          {state.email}
        </h1>
        <p className='mt-2 text-sm text-[hsl(var(--muted-foreground))]'>
          Access your saved quotes, download receipts, and track orders from one place.
        </p>
        <div className='mt-4 flex flex-wrap gap-3'>
          <Link href='/account/orders' className={buttonStyles.primary}>
            View orders
          </Link>
          <Link href='/support/returns' className={buttonStyles.outline}>
            Start a return
          </Link>
          <Button variant='ghost' onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </header>

      <section className='grid gap-6 md:grid-cols-2'>
        <div className='rounded-xl border border-border/50 bg-white p-6 shadow-sm'>
          <h2 className='text-lg font-semibold text-[hsl(var(--ink))]'>
            Quick actions
          </h2>
          <ul className='mt-4 space-y-3 text-sm text-[hsl(var(--body))]'>
            <li>
              <Link
                href='/support/faq'
                className='text-[hsl(var(--brand))] hover:text-[hsl(var(--brand-dark))]'
              >
                Need help? Visit the FAQ
              </Link>
            </li>
            <li>
              <Link
                href='/support/returns'
                className='text-[hsl(var(--brand))] hover:text-[hsl(var(--brand-dark))]'
              >
                Review the return policy
              </Link>
            </li>
            <li>
              <a
                href='mailto:support@labessentials.com'
                className='text-[hsl(var(--brand))] hover:text-[hsl(var(--brand-dark))]'
              >
                Email support@labessentials.com
              </a>
            </li>
          </ul>
        </div>

        <div className='rounded-xl border border-border/50 bg-white p-6 shadow-sm'>
          <h2 className='text-lg font-semibold text-[hsl(var(--ink))]'>
            Saved resources
          </h2>
          <p className='mt-2 text-sm text-[hsl(var(--muted-foreground))]'>
            We are rolling out more account features over the coming weeks. Stay tuned for
            downloadable calibration records and proactive maintenance reminders.
          </p>
        </div>
      </section>
    </div>
  );
}
