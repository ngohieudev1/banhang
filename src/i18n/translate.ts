import type { Locale } from "./config";
import { en } from "./messages/en";
import { vi } from "./messages/vi";

const dictionaries: Record<Locale, Record<string, string>> = { en, vi };

export type Vars = Record<string, string | number>;

export const hasMessage = (locale: Locale, key: string): boolean => key in dictionaries[locale];

export function translate(locale: Locale, key: string, vars?: Vars): string {
  const template = dictionaries[locale][key] ?? en[key as keyof typeof en] ?? key;
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}
