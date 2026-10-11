import { payloadGet } from "@/lib/payload";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!Array.isArray(body?.productIds) || !body.productIds.length || body.productIds.length > 50 ||
    !body.productIds.every((slug: unknown) => typeof slug === "string" && slug.length > 0 && slug.length <= 200)) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }
  const slugs = [...new Set<string>(body.productIds)];
  const [settings, ...products] = await Promise.all([
    payloadGet<{ shippingFee?: number | null }>("/globals/site-settings", 0),
    ...slugs.map((slug) => payloadGet<{ docs: { freeShipping?: boolean }[] }>(
      `/products?depth=0&limit=1&where[slug][equals]=${encodeURIComponent(slug)}&where[_status][equals]=published`, 0,
    )),
  ]);
  if (!settings || products.some((result) => !result?.docs?.length)) {
    return Response.json({ error: "unavailable" }, { status: 502 });
  }
  const baseFee = settings.shippingFee ?? 30000;
  if (!Number.isFinite(baseFee) || baseFee < 0) {
    return Response.json({ error: "unavailable" }, { status: 502 });
  }
  const shippingFee = products.some((result) => result?.docs[0].freeShipping === true) ? 0 : baseFee;
  return Response.json({ shippingFee });
}