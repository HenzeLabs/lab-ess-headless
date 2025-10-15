import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    products: [],
    collections: [],
    pages: [],
    articles: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalResults: 0,
      hasNextPage: false,
      hasPreviousPage: false
    }
  });
}
