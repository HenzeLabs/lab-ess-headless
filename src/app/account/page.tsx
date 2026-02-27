import { cookies } from 'next/headers';

import AccountClient from './AccountClient';
import { layout } from '@/lib/ui';

export default async function AccountPage() {
  const cookieStore = await cookies();
  const hasRefreshToken = Boolean(cookieStore.get('refreshToken'));

  return (
    <main className='bg-[hsl(var(--bg))] text-[hsl(var(--ink))]'>
      <section className={`${layout.container} py-12 md:py-16`}>
        <AccountClient hasRefreshToken={hasRefreshToken} />
      </section>
    </main>
  );
}
