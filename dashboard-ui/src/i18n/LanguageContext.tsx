import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export const LANGUAGES = [
  { code: "en", flag: "🇬🇧" },
  { code: "fr", flag: "🇫🇷" },
  { code: "es", flag: "🇪🇸" },
  { code: "de", flag: "🇩🇪" },
] as const;

export type Language = (typeof LANGUAGES)[number]["code"];

const STORAGE_KEY = "dashboard_lang";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLanguage(value: string | null): value is Language {
  return LANGUAGES.some((l) => l.code === value);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isLanguage(stored) ? stored : "en";
  });

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}

/** Construit un t(key) à partir d'un dictionnaire {lang: {key: string}}, avec repli sur l'anglais. */
export function makeTranslator<T extends object>(
  dict: Record<Language, T>,
  language: Language,
) {
  return (key: keyof T): string =>
    String((dict[language] as Record<keyof T, string>)?.[key] ?? (dict.en as Record<keyof T, string>)[key] ?? key);
}
