'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Call the logout API route to clear the HttpOnly cookie
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        console.log('Logout successful');
        router.push('/'); // Redirect to home page after successful logout
      } else {
        console.error('Logout failed', await response.json());
        // Optionally, display an error message to the user
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Optionally, display an error message to the user
    }
  };

  // User is authenticated, show account dashboard
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Profile</h2>
          <p className="text-gray-600">Manage your personal information</p>
          <a
            href="/account/profile"
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            View Profile →
          </a>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Orders</h2>
          <p className="text-gray-600">View your order history</p>
          <Link
            href="/account/orders/"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
          >
            View Order History →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Settings</h2>
          <p className="text-gray-600">Account preferences and settings</p>
          <a
            href="/account/settings"
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            View Settings →
          </a>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
