"use client";

import * as React from "react";
import en from "./locales/en.json";
import km from "./locales/km.json";

// ─── Types ───
export type Locale = "en" | "km";

type NestedRecord = { [key: string]: string | NestedRecord };

const translations: Record<Locale, NestedRecord> = { en, km };

// ─── Context ───
interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = React.createContext<I18nContextValue | undefined>(undefined);

const STORAGE_KEY = "app-locale";

// ─── Provider ───
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>("km");

  // Hydrate from localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && (stored === "en" || stored === "km")) {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = React.useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);

    // Update the html lang attribute
    document.documentElement.lang = newLocale;

    // Apply Khmer font when locale is km
    if (newLocale === "km") {
      document.documentElement.classList.add("font-khmer");
    } else {
      document.documentElement.classList.remove("font-khmer");
    }
  }, []);

  /**
   * Translate a dot-separated key, e.g. t("nav.dashboard").
   * Falls back to the key itself if not found.
   */
  const t = React.useCallback(
    (key: string): string => {
      const parts = key.split(".");
      let result: NestedRecord | string = translations[locale];

      for (const part of parts) {
        if (typeof result === "object" && result !== null && part in result) {
          result = result[part];
        } else {
          // Fallback to English
          let fallback: NestedRecord | string = translations["en"];
          for (const p of parts) {
            if (
              typeof fallback === "object" &&
              fallback !== null &&
              p in fallback
            ) {
              fallback = fallback[p];
            } else {
              return key; // Key not found in any locale
            }
          }
          return typeof fallback === "string" ? fallback : key;
        }
      }

      return typeof result === "string" ? result : key;
    },
    [locale]
  );

  // Set initial html lang
  React.useEffect(() => {
    document.documentElement.lang = locale;
    if (locale === "km") {
      document.documentElement.classList.add("font-khmer");
    } else {
      document.documentElement.classList.remove("font-khmer");
    }
  }, [locale]);

  const value = React.useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// ─── Hook ───
export function useI18n() {
  const context = React.useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
