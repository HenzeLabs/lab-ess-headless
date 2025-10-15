import { NextRequest, NextResponse } from 'next/server';
import { customerService } from '@/lib/services/customer';
import { OrdersQuery } from '@/types/customer';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('customer_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);

    const query: OrdersQuery = {
      first: parseInt(searchParams.get('first') || '10'),
      after: searchParams.get('after') || undefined,
      sortKey:
        (searchParams.get('sortKey') as 'PROCESSED_AT' | 'TOTAL_PRICE') ||
        'PROCESSED_AT',
      reverse: searchParams.get('reverse') !== 'false',
      query: searchParams.get('query') || undefined,
    };

    const result = await customerService.getCustomerOrders(token, query);

    return NextResponse.json({
      orders: result.orders,
      pageInfo: {
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
        endCursor: result.endCursor,
        startCursor: result.startCursor,
      },
      totalCount: result.totalCount,
    });
  } catch (error) {
    console.error('Get customer orders API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
