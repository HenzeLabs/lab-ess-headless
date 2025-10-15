import { shopifyFetch } from '@/lib/shopify';
import {
  CUSTOMER_ACCESS_TOKEN_CREATE,
  CUSTOMER_ACCESS_TOKEN_RENEW,
  CUSTOMER_ACCESS_TOKEN_DELETE,
  CUSTOMER_CREATE,
  CUSTOMER_UPDATE,
  GET_CUSTOMER,
  GET_CUSTOMER_ORDERS,
  CUSTOMER_ADDRESS_CREATE,
  CUSTOMER_ADDRESS_UPDATE,
  CUSTOMER_ADDRESS_DELETE,
  CUSTOMER_DEFAULT_ADDRESS_UPDATE,
  CUSTOMER_RECOVER,
} from '@/lib/queries/customer';
import {
  Customer,
  CustomerAddress,
  CustomerAccessToken,
  CustomerLoginInput,
  CustomerRegisterInput,
  CustomerUpdateInput,
  CustomerAddressInput,
  CustomerTokenResponse,
  CustomerCreateResponse,
  CustomerResponse,
  CustomerError,
  Order,
  OrdersQuery,
} from '@/types/customer';

// Customer Authentication Service
export class CustomerService {
  private static instance: CustomerService;

  public static getInstance(): CustomerService {
    if (!CustomerService.instance) {
      CustomerService.instance = new CustomerService();
    }
    return CustomerService.instance;
  }

  /**
   * Login customer with email and password
   */
  async login(credentials: CustomerLoginInput): Promise<{
    accessToken?: CustomerAccessToken;
    errors?: CustomerError[];
  }> {
    try {
      const response = await shopifyFetch<CustomerTokenResponse>({
        query: CUSTOMER_ACCESS_TOKEN_CREATE,
        variables: {
          input: {
            email: credentials.email,
            password: credentials.password,
          },
        },
      });

      const { customerAccessToken, customerUserErrors } =
        response.data.customerAccessTokenCreate;

      if (customerUserErrors.length > 0) {
        return { errors: customerUserErrors };
      }

      return { accessToken: customerAccessToken };
    } catch (error) {
      console.error('Customer login error:', error);
      throw new Error('Failed to login customer');
    }
  }

  /**
   * Register new customer
   */
  async register(data: CustomerRegisterInput): Promise<{
    customer?: Customer;
    errors?: CustomerError[];
  }> {
    try {
      const response = await shopifyFetch<CustomerCreateResponse>({
        query: CUSTOMER_CREATE,
        variables: {
          input: {
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            acceptsMarketing: data.acceptsMarketing || false,
          },
        },
      });

      const { customer, customerUserErrors } = response.data.customerCreate;

      if (customerUserErrors.length > 0) {
        return { errors: customerUserErrors };
      }

      return { customer };
    } catch (error) {
      console.error('Customer registration error:', error);
      throw new Error('Failed to register customer');
    }
  }

  /**
   * Get customer details by access token
   */
  async getCustomer(accessToken: string): Promise<Customer | null> {
    try {
      const response = await shopifyFetch<CustomerResponse>({
        query: GET_CUSTOMER,
        variables: { customerAccessToken: accessToken },
      });

      return response.data.customer || null;
    } catch (error) {
      console.error('Get customer error:', error);
      return null;
    }
  }

  /**
   * Update customer profile
   */
  async updateCustomer(
    accessToken: string,
    data: CustomerUpdateInput,
  ): Promise<{
    customer?: Customer;
    errors?: CustomerError[];
  }> {
    try {
      const response = await shopifyFetch<{
        customerUpdate: {
          customer?: Customer;
          customerUserErrors: CustomerError[];
        };
      }>({
        query: CUSTOMER_UPDATE,
        variables: {
          customerAccessToken: accessToken,
          customer: data,
        },
      });

      const { customer, customerUserErrors } = response.data.customerUpdate;

      if (customerUserErrors.length > 0) {
        return { errors: customerUserErrors };
      }

      return { customer };
    } catch (error) {
      console.error('Customer update error:', error);
      throw new Error('Failed to update customer');
    }
  }

  /**
   * Get customer orders with pagination
   */
  async getCustomerOrders(
    accessToken: string,
    query: OrdersQuery = {},
  ): Promise<{
    orders: Order[];
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    endCursor?: string;
    startCursor?: string;
  }> {
    try {
      const response = await shopifyFetch<{
        customer: {
          orders: {
            totalCount: number;
            pageInfo: {
              hasNextPage: boolean;
              hasPreviousPage: boolean;
              startCursor?: string;
              endCursor?: string;
            };
            edges: Array<{
              node: Order;
              cursor: string;
            }>;
          };
        };
      }>({
        query: GET_CUSTOMER_ORDERS,
        variables: {
          customerAccessToken: accessToken,
          first: query.first || 10,
          after: query.after,
          sortKey: query.sortKey || 'PROCESSED_AT',
          reverse: query.reverse !== false, // Default to newest first
          query: query.query,
        },
      });

      const { orders } = response.data.customer;

      return {
        orders: orders.edges.map((edge) => edge.node),
        totalCount: orders.totalCount,
        hasNextPage: orders.pageInfo.hasNextPage,
        hasPreviousPage: orders.pageInfo.hasPreviousPage,
        endCursor: orders.pageInfo.endCursor,
        startCursor: orders.pageInfo.startCursor,
      };
    } catch (error) {
      console.error('Get customer orders error:', error);
      throw new Error('Failed to get customer orders');
    }
  }

  /**
   * Add customer address
   */
  async addAddress(
    accessToken: string,
    address: CustomerAddressInput,
  ): Promise<{
    address?: CustomerAddress;
    errors?: CustomerError[];
  }> {
    try {
      const response = await shopifyFetch<{
        customerAddressCreate: {
          customerAddress?: CustomerAddress;
          customerUserErrors: CustomerError[];
        };
      }>({
        query: CUSTOMER_ADDRESS_CREATE,
        variables: {
          customerAccessToken: accessToken,
          address,
        },
      });

      const { customerAddress, customerUserErrors } =
        response.data.customerAddressCreate;

      if (customerUserErrors.length > 0) {
        return { errors: customerUserErrors };
      }

      return { address: customerAddress };
    } catch (error) {
      console.error('Add address error:', error);
      throw new Error('Failed to add address');
    }
  }

  /**
   * Update customer address
   */
  async updateAddress(
    accessToken: string,
    addressId: string,
    address: CustomerAddressInput,
  ): Promise<{
    address?: CustomerAddress;
    errors?: CustomerError[];
  }> {
    try {
      const response = await shopifyFetch<{
        customerAddressUpdate: {
          customerAddress?: CustomerAddress;
          customerUserErrors: CustomerError[];
        };
      }>({
        query: CUSTOMER_ADDRESS_UPDATE,
        variables: {
          customerAccessToken: accessToken,
          id: addressId,
          address,
        },
      });

      const { customerAddress, customerUserErrors } =
        response.data.customerAddressUpdate;

      if (customerUserErrors.length > 0) {
        return { errors: customerUserErrors };
      }

      return { address: customerAddress };
    } catch (error) {
      console.error('Update address error:', error);
      throw new Error('Failed to update address');
    }
  }

  /**
   * Delete customer address
   */
  async deleteAddress(
    accessToken: string,
    addressId: string,
  ): Promise<{
    deletedId?: string;
    errors?: CustomerError[];
  }> {
    try {
      const response = await shopifyFetch<{
        customerAddressDelete: {
          deletedCustomerAddressId?: string;
          customerUserErrors: CustomerError[];
        };
      }>({
        query: CUSTOMER_ADDRESS_DELETE,
        variables: {
          customerAccessToken: accessToken,
          id: addressId,
        },
      });

      const { deletedCustomerAddressId, customerUserErrors } =
        response.data.customerAddressDelete;

      if (customerUserErrors.length > 0) {
        return { errors: customerUserErrors };
      }

      return { deletedId: deletedCustomerAddressId };
    } catch (error) {
      console.error('Delete address error:', error);
      throw new Error('Failed to delete address');
    }
  }

  /**
   * Set default customer address
   */
  async setDefaultAddress(
    accessToken: string,
    addressId: string,
  ): Promise<{
    customer?: Customer;
    errors?: CustomerError[];
  }> {
    try {
      const response = await shopifyFetch<{
        customerDefaultAddressUpdate: {
          customer?: Customer;
          customerUserErrors: CustomerError[];
        };
      }>({
        query: CUSTOMER_DEFAULT_ADDRESS_UPDATE,
        variables: {
          customerAccessToken: accessToken,
          addressId,
        },
      });

      const { customer, customerUserErrors } =
        response.data.customerDefaultAddressUpdate;

      if (customerUserErrors.length > 0) {
        return { errors: customerUserErrors };
      }

      return { customer };
    } catch (error) {
      console.error('Set default address error:', error);
      throw new Error('Failed to set default address');
    }
  }

  /**
   * Renew customer access token
   */
  async renewAccessToken(accessToken: string): Promise<{
    accessToken?: CustomerAccessToken;
    errors?: CustomerError[];
  }> {
    try {
      const response = await shopifyFetch<{
        customerAccessTokenRenew: {
          customerAccessToken?: CustomerAccessToken;
          customerUserErrors: CustomerError[];
        };
      }>({
        query: CUSTOMER_ACCESS_TOKEN_RENEW,
        variables: { customerAccessToken: accessToken },
      });

      const { customerAccessToken, customerUserErrors } =
        response.data.customerAccessTokenRenew;

      if (customerUserErrors.length > 0) {
        return { errors: customerUserErrors };
      }

      return { accessToken: customerAccessToken };
    } catch (error) {
      console.error('Renew access token error:', error);
      throw new Error('Failed to renew access token');
    }
  }

  /**
   * Logout customer (delete access token)
   */
  async logout(accessToken: string): Promise<{
    success: boolean;
    errors?: CustomerError[];
  }> {
    try {
      const response = await shopifyFetch<{
        customerAccessTokenDelete: {
          deletedAccessToken?: string;
          customerUserErrors: CustomerError[];
        };
      }>({
        query: CUSTOMER_ACCESS_TOKEN_DELETE,
        variables: { customerAccessToken: accessToken },
      });

      const { deletedAccessToken, customerUserErrors } =
        response.data.customerAccessTokenDelete;

      if (customerUserErrors.length > 0) {
        return { success: false, errors: customerUserErrors };
      }

      return { success: !!deletedAccessToken };
    } catch (error) {
      console.error('Customer logout error:', error);
      throw new Error('Failed to logout customer');
    }
  }

  /**
   * Send password recovery email
   */
  async recoverPassword(email: string): Promise<{
    success: boolean;
    errors?: CustomerError[];
  }> {
    try {
      const response = await shopifyFetch<{
        customerRecover: {
          customerUserErrors: CustomerError[];
        };
      }>({
        query: CUSTOMER_RECOVER,
        variables: { email },
      });

      const { customerUserErrors } = response.data.customerRecover;

      if (customerUserErrors.length > 0) {
        return { success: false, errors: customerUserErrors };
      }

      return { success: true };
    } catch (error) {
      console.error('Customer recover error:', error);
      throw new Error('Failed to recover password');
    }
  }
}

// Singleton instance
export const customerService = CustomerService.getInstance();
