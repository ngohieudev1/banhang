import { NextResponse } from "next/server";
import { payloadGet, payloadPost } from "@/lib/payload";

type Body = { slug?: unknown; authorName?: unknown; rating?: unknown; comment?: unknown };

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Body | null;

  const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
  const authorName = typeof body?.authorName === "string" ? body.authorName.trim() : "";
  const comment = typeof body?.comment === "string" ? body.comment.trim() : "";
  const rating = body?.rating;

  const valid =
    slug.length > 0 &&
    slug.length <= 200 &&
    authorName.length > 0 &&
    authorName.length <= 80 &&
    comment.length > 0 &&
    comment.length <= 2000 &&
    typeof rating === "number" &&
    Number.isInteger(rating) &&
    rating >= 1 &&
    rating <= 5;

  if (!valid) return NextResponse.json({ ok: false }, { status: 400 });

  const found = await payloadGet<{ docs: { id: string }[] }>(
    `/products?limit=1&depth=0&where[slug][equals]=${encodeURIComponent(slug)}&where[_status][equals]=published`,
    0,
  );
  const productId = found?.docs?.[0]?.id;
  if (!productId) return NextResponse.json({ ok: false }, { status: 404 });

  // Status is not sent: the admin stores new reviews as pending until approved.
  const saved = await payloadPost("/reviews", { product: productId, authorName, rating, comment });

  return NextResponse.json({ ok: saved }, { status: saved ? 200 : 502 });
}
