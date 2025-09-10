// ISR revalidation API route for Next.js App Router
// Triggers revalidation of a given path via secret token
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { path, secret } = await req.json();
  if (secret !== process.env.REVALIDATE_SECRET_TOKEN) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
  if (!path) {
    return NextResponse.json({ message: "Missing path" }, { status: 400 });
  }
  try {
    // Revalidate the given path
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/revalidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, secret }),
    });
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    return NextResponse.json(
      { message: "Error revalidating", error: String(err) },
      { status: 500 },
    );
  }
}
