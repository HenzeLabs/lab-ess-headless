// Shopify Customer Account API Types

export interface Customer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName: string;
  phone?: string;
  acceptsMarketing: boolean;
  createdAt: string;
  updatedAt: string;
  defaultAddress?: CustomerAddress;
  addresses: CustomerAddress[];
  orders: {
    totalCount: number;
    edges: Array<{
      node: Order;
    }>;
  };
}

export interface CustomerAddress {
  id: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  country: string;
  zip: string;
  phone?: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  orderNumber: number;
  processedAt: string;
  financialStatus: OrderFinancialStatus;
  fulfillmentStatus: OrderFulfillmentStatus;
  totalPrice: {
    amount: string;
    currencyCode: string;
  };
  subtotalPrice: {
    amount: string;
    currencyCode: string;
  };
  totalTax: {
    amount: string;
    currencyCode: string;
  };
  totalShipping: {
    amount: string;
    currencyCode: string;
  };
  lineItems: {
    edges: Array<{
      node: OrderLineItem;
    }>;
  };
  shippingAddress?: CustomerAddress;
  billingAddress?: CustomerAddress;
  statusUrl: string;
}

export interface OrderLineItem {
  id: string;
  title: string;
  quantity: number;
  variant: {
    id: string;
    title: string;
    image?: {
      url: string;
      altText?: string;
    };
    price: {
      amount: string;
      currencyCode: string;
    };
    product: {
      id: string;
      title: string;
      handle: string;
    };
  };
  originalTotalPrice: {
    amount: string;
    currencyCode: string;
  };
  discountedTotalPrice: {
    amount: string;
    currencyCode: string;
  };
}

export type OrderFinancialStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED'
  | 'VOIDED';

export type OrderFulfillmentStatus =
  | 'UNFULFILLED'
  | 'PARTIALLY_FULFILLED'
  | 'FULFILLED'
  | 'RESTOCKED';

// Authentication Types
export interface CustomerAccessToken {
  accessToken: string;
  expiresAt: string;
}

export interface CustomerLoginInput {
  email: string;
  password: string;
}

export interface CustomerRegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  acceptsMarketing?: boolean;
}

export interface CustomerUpdateInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  acceptsMarketing?: boolean;
}

export interface CustomerAddressInput {
  firstName?: string;
  lastName?: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  country: string;
  zip: string;
  phone?: string;
}

// API Response Types
export interface CustomerTokenResponse {
  customerAccessTokenCreate: {
    customerAccessToken?: CustomerAccessToken;
    customerUserErrors: Array<{
      field?: string[];
      message: string;
      code: string;
    }>;
  };
}

export interface CustomerCreateResponse {
  customerCreate: {
    customer?: Customer;
    customerUserErrors: Array<{
      field?: string[];
      message: string;
      code: string;
    }>;
  };
}

export interface CustomerResponse {
  customer?: Customer;
}

// Session Types
export interface CustomerSession {
  accessToken: string;
  expiresAt: string;
  customer: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    displayName: string;
  };
}

// Error Types
export interface CustomerError {
  field?: string[];
  message: string;
  code: string;
}

// Hook Types
export interface UseCustomerState {
  customer: Customer | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface UseCustomerActions {
  login: (credentials: CustomerLoginInput) => Promise<void>;
  register: (data: CustomerRegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: CustomerUpdateInput) => Promise<void>;
  addAddress: (address: CustomerAddressInput) => Promise<void>;
  updateAddress: (id: string, address: CustomerAddressInput) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export interface UseCustomer extends UseCustomerState, UseCustomerActions {}

// Order History Types
export interface OrderFilters {
  status?: OrderFinancialStatus;
  fulfillmentStatus?: OrderFulfillmentStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface OrdersQuery {
  first?: number;
  after?: string;
  sortKey?: 'PROCESSED_AT' | 'TOTAL_PRICE';
  reverse?: boolean;
  query?: string;
}

export interface UseOrderHistoryState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalCount: number;
}

export interface UseOrderHistoryActions {
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  applyFilters: (filters: OrderFilters) => Promise<void>;
  clearFilters: () => Promise<void>;
}

export interface UseOrderHistory
  extends UseOrderHistoryState,
    UseOrderHistoryActions {}
