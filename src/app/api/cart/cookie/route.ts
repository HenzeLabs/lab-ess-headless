import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('cartId');

  return NextResponse.json({ success: true });
}
