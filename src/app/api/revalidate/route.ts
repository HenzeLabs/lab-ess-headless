import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidate-secret");
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  const { path } = await request.json();

  if (!path) {
    return NextResponse.json(
      { message: "Missing path to revalidate" },
      { status: 400 }
    );
  }

  try {
    revalidatePath(path);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[api/revalidate]`, msg);
    return NextResponse.json(
      { message: `Error revalidating: ${msg}` },
      { status: 500 }
    );
  }
}
