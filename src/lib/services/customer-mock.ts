import {
  Customer,
  CustomerAccessToken,
  CustomerLoginInput,
  CustomerRegisterInput,
  CustomerError,
} from '@/types/customer';

// Mock implementation of CustomerService for development/testing
// This provides the same interface as the real service but uses mock data
export class MockCustomerService {
  private static instance: MockCustomerService;
  private mockUsers: Map<string, { customer: Customer; password: string }> =
    new Map();

  public static getInstance(): MockCustomerService {
    if (!MockCustomerService.instance) {
      MockCustomerService.instance = new MockCustomerService();
    }
    return MockCustomerService.instance;
  }

  /**
   * Mock login - validates email/password and returns fake token
   */
  async login(credentials: CustomerLoginInput): Promise<{
    accessToken?: CustomerAccessToken;
    errors?: CustomerError[];
  }> {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const userData = this.mockUsers.get(credentials.email);

      if (!userData || userData.password !== credentials.password) {
        return {
          errors: [
            {
              field: ['email'],
              message: 'Invalid email or password',
              code: 'INVALID',
            },
          ],
        };
      }

      const accessToken: CustomerAccessToken = {
        accessToken: `mock_token_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2)}`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      };

      return { accessToken };
    } catch (error) {
      console.error('Mock customer login error:', error);
      return {
        errors: [
          {
            field: ['general'],
            message: 'An error occurred during login',
            code: 'INTERNAL_ERROR',
          },
        ],
      };
    }
  }

  /**
   * Mock register - creates fake customer and stores in memory
   */
  async register(data: CustomerRegisterInput): Promise<{
    customer?: Customer;
    errors?: CustomerError[];
  }> {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Check if user already exists
      if (this.mockUsers.has(data.email)) {
        return {
          errors: [
            {
              field: ['email'],
              message: 'Email has already been taken',
              code: 'TAKEN',
            },
          ],
        };
      }

      // Create mock customer
      const customer: Customer = {
        id: `mock_customer_${Date.now()}`,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        displayName:
          `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email,
        phone: data.phone,
        acceptsMarketing: data.acceptsMarketing || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        addresses: [],
        orders: {
          totalCount: 0,
          edges: [],
        },
      };

      // Store user in mock database
      this.mockUsers.set(data.email, { customer, password: data.password });

      return { customer };
    } catch (error) {
      console.error('Mock customer registration error:', error);
      return {
        errors: [
          {
            field: ['general'],
            message: 'An error occurred during registration',
            code: 'INTERNAL_ERROR',
          },
        ],
      };
    }
  }

  /**
   * Mock get customer by token
   */
  async getCustomer(accessToken: string): Promise<Customer | null> {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      // For mock implementation, we'll create a basic customer
      // In real implementation, this would decode the token and fetch from Shopify
      if (accessToken.startsWith('mock_token_')) {
        return {
          id: 'mock_customer_current',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          displayName: 'Test User',
          phone: undefined,
          acceptsMarketing: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          addresses: [],
          orders: {
            totalCount: 0,
            edges: [],
          },
        };
      }

      return null;
    } catch (error) {
      console.error('Mock get customer error:', error);
      return null;
    }
  }

  /**
   * Mock logout - always succeeds
   */
  async logout(): Promise<{ errors?: CustomerError[] }> {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 200));

      // For mock implementation, logout always succeeds
      return {};
    } catch (error) {
      console.error('Mock customer logout error:', error);
      return {
        errors: [
          {
            field: ['general'],
            message: 'An error occurred during logout',
            code: 'INTERNAL_ERROR',
          },
        ],
      };
    }
  }
}

// Export singleton instance
export const mockCustomerService = MockCustomerService.getInstance();
