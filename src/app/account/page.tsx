"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import SiteHeader from "@/components/feature/SiteHeader";
import SiteFooter from "@/components/feature/SiteFooter";
import { useT } from "@/i18n/LocaleProvider";

type Customer = { name?: string; email?: string; phone?: string };

export default function AccountPage() {
  const { locale } = useT();
  const vi = locale === "vi";
  const [mode, setMode] = useState<"login" | "register">("login");
  const [user, setUser] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/account").then(async (response) => {
      if (!response.ok) throw new Error();
      setUser((await response.json()).user);
    }).catch(() => setError(vi ? "Không thể tải tài khoản. Vui lòng tải lại trang." : "Unable to load your account. Please reload.")).finally(() => setLoading(false));
  }, [vi]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    if (mode === "register" && data.get("password") !== data.get("confirm")) {
      setError(vi ? "Mật khẩu xác nhận không khớp." : "Passwords do not match.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/account", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: mode, identifier: data.get("identifier"), password: data.get("password"), name: data.get("name") }) });
      if (response.status === 400) {
        const result = await response.json();
        if (result.error === "identifier") {
          setError(vi ? "Nhập email hợp lệ hoặc số điện thoại Việt Nam gồm 10 chữ số (có thể dùng +84 thay cho số 0 đầu)." : "Enter a valid email or a 10-digit Vietnamese phone number (+84 may replace the leading 0).");
          return;
        }
      }
      if (!response.ok) throw new Error();
      setUser((await response.json()).user);
    } catch {
      setError(vi ? (mode === "register" ? "Không thể tạo tài khoản. Kiểm tra email/số điện thoại hoặc dùng tài khoản đã có." : "Không thể đăng nhập. Kiểm tra thông tin hoặc thử lại sau.") : "Unable to continue. Check your credentials or try again later.");
    } finally { setBusy(false); }
  }

  async function logout() {
    setBusy(true);
    try {
      const response = await fetch("/api/account", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) });
      if (!response.ok) throw new Error();
      setUser(null);
    } catch { setError(vi ? "Không thể đăng xuất. Vui lòng thử lại." : "Unable to sign out. Please try again."); }
    finally { setBusy(false); }
  }

  const inputClass = "mt-2 w-full rounded-md border border-background-300 bg-background-50 px-3 py-3 text-sm outline-none focus:border-foreground-900";
  return <div className="flex min-h-screen flex-col bg-background-50">
    <SiteHeader />
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-12 md:py-16">
      <h1 className="font-heading text-2xl font-extrabold">{vi ? "Tài khoản" : "Account"}</h1>
      {loading ? <p className="mt-6" role="status">{vi ? "Đang tải…" : "Loading…"}</p> : user ? <div className="mt-6 space-y-4">
        <p className="break-words text-lg font-bold">{user.name || user.email || user.phone}</p>
        <p className="break-words text-sm">{user.email || user.phone}</p>
        <Link className="inline-flex items-center gap-2 underline" href="/"><i className="ri-shopping-bag-line" />{vi ? "Tiếp tục mua sắm" : "Continue shopping"}</Link>
        <button disabled={busy} onClick={logout} className="flex items-center gap-2 py-3 text-sm font-bold disabled:opacity-50"><i className="ri-logout-box-line" />{vi ? "Đăng xuất" : "Sign out"}</button>
      </div> : <>
        <div className="mt-6 flex border-b border-background-300" role="tablist" aria-label={vi ? "Tài khoản" : "Account"}>
          {(["login", "register"] as const).map(value => <button key={value} role="tab" aria-selected={mode === value} onClick={() => { setMode(value); setError(""); }} className={`flex-1 border-b-2 px-2 py-3 text-sm font-bold ${mode === value ? "border-foreground-950" : "border-transparent text-foreground-500"}`}>{value === "login" ? (vi ? "Đăng nhập" : "Sign in") : (vi ? "Tạo tài khoản miễn phí" : "Create free account")}</button>)}
        </div>
        <form onSubmit={submit} className="mt-6 space-y-5" key={mode}>
          {mode === "register" && <label className="block text-sm font-semibold">{vi ? "Họ tên" : "Full name"}<input name="name" autoComplete="name" maxLength={100} className={inputClass} /></label>}
          <label className="block text-sm font-semibold">{vi ? "Email hoặc số điện thoại" : "Email or phone number"}<input name="identifier" required autoComplete="username" maxLength={254} className={inputClass} /></label>
          <label className="block text-sm font-semibold">{vi ? "Mật khẩu" : "Password"}<input name="password" type="password" required minLength={mode === "register" ? 8 : 1} maxLength={128} autoComplete={mode === "register" ? "new-password" : "current-password"} className={inputClass} /></label>
          {mode === "register" && <label className="block text-sm font-semibold">{vi ? "Xác nhận mật khẩu" : "Confirm password"}<input name="confirm" type="password" required minLength={8} maxLength={128} autoComplete="new-password" className={inputClass} /></label>}
          <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-md bg-foreground-950 px-4 py-3 text-sm font-bold text-background-50 disabled:opacity-50"><i className={mode === "register" ? "ri-user-add-line" : "ri-login-box-line"} />{busy ? (vi ? "Đang xử lý…" : "Processing…") : mode === "register" ? (vi ? "Tạo tài khoản" : "Create account") : (vi ? "Đăng nhập" : "Sign in")}</button>
        </form>
      </>}
      {error && <p role="alert" className="mt-4 text-sm text-accent-700">{error}</p>}
    </main>
    <SiteFooter />
  </div>;
}