'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Customer,
  CustomerLoginInput,
  CustomerRegisterInput,
  CustomerUpdateInput,
  CustomerAddressInput,
  Order,
} from '@/types/customer';

// Simple hook without context for now - context can be added later
export function useCustomer() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!customer;

  // Load customer on mount
  useEffect(() => {
    const loadCustomer = async () => {
      try {
        const response = await fetch('/api/customer/profile');

        if (response.ok) {
          const data = await response.json();
          setCustomer(data.customer);
        }
      } catch (err) {
        console.error('Failed to load customer:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, []);

  const login = useCallback(async (credentials: CustomerLoginInput) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setCustomer(data.customer);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data: CustomerRegisterInput) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      // Registration successful, but customer needs to activate account
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });

      setCustomer(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Clear local state even if logout request fails
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(
    async (data: CustomerUpdateInput) => {
      if (!customer) {
        throw new Error('Not authenticated');
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/customer/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Update failed');
        }

        setCustomer(result.customer);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Update failed';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [customer],
  );

  const addAddress = useCallback(
    async (address: CustomerAddressInput) => {
      if (!customer) {
        throw new Error('Not authenticated');
      }

      // TODO: Implement address management API
      console.log('Add address:', address);
      throw new Error('Address management not yet implemented');
    },
    [customer],
  );

  const updateAddress = useCallback(
    async (id: string, address: CustomerAddressInput) => {
      if (!customer) {
        throw new Error('Not authenticated');
      }

      // TODO: Implement address management API
      console.log('Update address:', id, address);
      throw new Error('Address management not yet implemented');
    },
    [customer],
  );

  const deleteAddress = useCallback(
    async (id: string) => {
      if (!customer) {
        throw new Error('Not authenticated');
      }

      // TODO: Implement address management API
      console.log('Delete address:', id);
      throw new Error('Address management not yet implemented');
    },
    [customer],
  );

  const setDefaultAddress = useCallback(
    async (id: string) => {
      if (!customer) {
        throw new Error('Not authenticated');
      }

      // TODO: Implement address management API
      console.log('Set default address:', id);
      throw new Error('Address management not yet implemented');
    },
    [customer],
  );

  const refresh = useCallback(async () => {
    if (!customer) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/customer/profile');

      if (response.ok) {
        const data = await response.json();
        setCustomer(data.customer);
      } else {
        // If profile fetch fails, customer might be logged out
        setCustomer(null);
      }
    } catch (err) {
      console.error('Refresh customer error:', err);
      setError('Failed to refresh customer data');
    } finally {
      setLoading(false);
    }
  }, [customer]);

  return {
    customer,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    refresh,
  };
}

// Hook for order history
export function useOrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [endCursor, setEndCursor] = useState<string | null>(null);

  const { isAuthenticated } = useCustomer();

  const loadOrders = useCallback(
    async (
      params: {
        first?: number;
        after?: string;
        query?: string;
      } = {},
    ) => {
      if (!isAuthenticated) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const searchParams = new URLSearchParams();

        if (params.first) searchParams.set('first', params.first.toString());
        if (params.after) searchParams.set('after', params.after);
        if (params.query) searchParams.set('query', params.query);

        const response = await fetch(`/api/customer/orders?${searchParams}`);

        if (!response.ok) {
          throw new Error('Failed to load orders');
        }

        const data = await response.json();

        if (params.after) {
          // Append to existing orders for pagination
          setOrders((prev) => [...prev, ...data.orders]);
        } else {
          // Replace orders for new query
          setOrders(data.orders);
        }

        setHasNextPage(data.pageInfo.hasNextPage);
        setHasPreviousPage(data.pageInfo.hasPreviousPage);
        setTotalCount(data.totalCount);
        setEndCursor(data.pageInfo.endCursor);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load orders';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated],
  );

  const loadMore = useCallback(async () => {
    if (!hasNextPage || !endCursor) {
      return;
    }

    await loadOrders({
      first: 10,
      after: endCursor,
    });
  }, [hasNextPage, endCursor, loadOrders]);

  const refresh = useCallback(async () => {
    await loadOrders();
  }, [loadOrders]);

  const applyFilters = useCallback(
    async (filters: { query?: string }) => {
      await loadOrders({
        first: 10,
        query: filters.query,
      });
    },
    [loadOrders],
  );

  const clearFilters = useCallback(async () => {
    await loadOrders({ first: 10 });
  }, [loadOrders]);

  // Load orders on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated, loadOrders]);

  return {
    orders,
    loading,
    error,
    hasNextPage,
    hasPreviousPage,
    totalCount,
    loadMore,
    refresh,
    applyFilters,
    clearFilters,
  };
}
