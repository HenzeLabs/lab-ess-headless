import { NextResponse } from 'next/server';
import { getReviewsForProduct, getAllReviews } from '@/lib/reviews';

/**
 * GET /api/reviews?product=handle
 * Returns reviews for a product, or all reviews if no handle provided.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productHandle = searchParams.get('product');

  const reviews = productHandle ? getReviewsForProduct(productHandle) : getAllReviews();

  return NextResponse.json({ reviews });
}

/**
 * POST /api/reviews
 * Accepts a new review submission.
 *
 * MVP: validates and returns success. In production this would write to
 * Shopify metafields, a database, or a third-party reviews service.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productHandle, author, email, rating, title, body: reviewBody } = body;

    // Validate required fields
    if (!productHandle || !author || !email || !rating || !title || !reviewBody) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 },
      );
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5.' },
        { status: 400 },
      );
    }

    // MVP: log and return success. Replace with actual persistence later.
    console.log('[reviews] New review submitted:', {
      productHandle,
      author,
      rating,
      title,
    });

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully. It will appear after moderation.',
    });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 },
    );
  }
}
