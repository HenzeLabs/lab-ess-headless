import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    results: {
      queries: [],
      products: [],
      collections: [],
      pages: [],
      articles: []
    },
    suggestions: []
  });
}
