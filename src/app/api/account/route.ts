import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_URL } from "@/lib/payload";

const COOKIE = "customer-session";
const invalid = (status = 400) => NextResponse.json({ error: "invalid" }, { status });
const safeUser = (user: { name?: string; email?: string; username?: string }) => ({ name: user.name, email: user.email, phone: user.username });

export async function GET() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return NextResponse.json({ user: null });
  try {
    const response = await fetch(`${ADMIN_URL}/api/users/me`, { headers: { Authorization: `JWT ${token}` }, cache: "no-store" });
    const result = await response.json();
    return NextResponse.json({ user: response.ok && result.user ? safeUser(result.user) : null });
  } catch {
    return invalid(502);
  }
}

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return invalid(403);
  const body = await request.json().catch(() => null);
  if (body?.action === "logout") {
    const token = (await cookies()).get(COOKIE)?.value;
    if (token) {
      try {
        const response = await fetch(`${ADMIN_URL}/api/users/logout`, { method: "POST", headers: { Authorization: `JWT ${token}` }, cache: "no-store" });
        if (!response.ok) return invalid(502);
      } catch { return invalid(502); }
    }
    (await cookies()).delete(COOKIE);
    return NextResponse.json({ ok: true });
  }
  if (!["login", "register"].includes(body?.action) || typeof body.identifier !== "string" || typeof body.password !== "string") return invalid();
  const identifier = body.identifier.trim().toLowerCase();
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
  let phone = identifier.replace(/[\s().-]/g, "");
  if (phone.startsWith("+84")) phone = `0${phone.slice(3)}`;
  if ((!isEmail && !/^0\d{9}$/.test(phone)) || identifier.length > 254) return NextResponse.json({ error: "identifier" }, { status: 400 });
  if (body.password.length > 128 || body.password.length < (body.action === "register" ? 8 : 1)) return invalid();
  const credentials = { ...(isEmail ? { email: identifier } : { username: phone }), password: body.password };
  try {
    if (body.action === "register") {
      const response = await fetch(`${ADMIN_URL}/api/users`, {
        method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store",
        body: JSON.stringify({ ...credentials, name: typeof body.name === "string" ? body.name.trim().slice(0, 100) : "" }),
      });
      if (!response.ok) return NextResponse.json({ error: "register" }, { status: response.status === 429 ? 429 : 400 });
    }
    const response = await fetch(`${ADMIN_URL}/api/users/login`, {
      method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", body: JSON.stringify(credentials),
    });
    const result = await response.json();
    if (!response.ok || !result.token || !result.user) return invalid(response.status === 429 ? 429 : 401);
    (await cookies()).set(COOKIE, result.token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 1209600 });
    return NextResponse.json({ user: safeUser(result.user) });
  } catch {
    return invalid(502);
  }
}