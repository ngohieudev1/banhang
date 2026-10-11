import { NextResponse } from "next/server";
import { ADMIN_URL } from "@/lib/payload";
import { shippingCountries } from "@/mocks/checkout";

type Line = { productId?: unknown; sku?: unknown; color?: unknown; quantity?: unknown };

const str = (value: unknown) => (typeof value === "string" ? value : "");

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || !Array.isArray(body.items)) return NextResponse.json({ ok: false }, { status: 400 });

  const country = shippingCountries.find((item) => item.id === body.country)?.label ?? str(body.country);

  const payload = {
    email: str(body.email),
    firstName: str(body.firstName),
    lastName: str(body.lastName),
    address: str(body.address),
    apartment: str(body.apartment),
    city: str(body.city),
    postalCode: str(body.postalCode),
    phone: str(body.phone),
    country,
    shipping: { method: "Tiêu chuẩn" },
    items: (body.items as Line[]).map((line) => ({
      productSlug: line.productId,
      skuId: line.sku,
      color: line.color,
      quantity: line.quantity,
    })),
  };

  try {
    const response = await fetch(`${ADMIN_URL}/api/storefront-orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const result = (await response.json().catch(() => null)) as {
      ok?: boolean;
      orderNumber?: string;
      error?: string;
    } | null;

    if (response.ok && result?.ok && result.orderNumber) {
      return NextResponse.json({ ok: true, orderNumber: result.orderNumber });
    }
    const status = response.status >= 400 && response.status < 500 ? response.status : 502;
    return NextResponse.json({ ok: false, error: result?.error ?? "server" }, { status });
  } catch {
    return NextResponse.json({ ok: false, error: "server" }, { status: 502 });
  }
}
