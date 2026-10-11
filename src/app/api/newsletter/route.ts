import { NextResponse } from "next/server";
import { payloadPost } from "@/lib/payload";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // contact-messages yêu cầu name và message nên điền nhãn cố định cho đăng ký nhận tin.
  const saved = await payloadPost("/contact-messages", {
    name: "Đăng ký nhận tin",
    email,
    message: "Khách đăng ký nhận tin từ footer website.",
  });

  return NextResponse.json({ ok: saved }, { status: saved ? 200 : 502 });
}
