const API = process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3001";
export const ADMIN_URL = API;

export async function payloadGet<T>(path: string, revalidate = 60): Promise<T | null> {
  try {
    const res = await fetch(`${API}/api${path}`, { next: { revalidate } });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

export async function payloadPost(path: string, body: unknown): Promise<boolean> {
  try {
    const res = await fetch(`${API}/api${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export type Faq = { id: string; question: string; answer: string };
export type Store = { id: string; name: string; address: string; phone?: string; hours?: string; mapUrl?: string };
