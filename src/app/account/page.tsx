import { redirect } from 'next/navigation';

export default function AccountPage() {
  // Redirect to login for now, full account functionality will be added later
  redirect('/account/login');
}
