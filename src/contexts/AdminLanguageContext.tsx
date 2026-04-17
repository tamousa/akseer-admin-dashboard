import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

type Lang = "ar" | "en";

interface AdminLangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (ar: string, en: string) => string;
  isRTL: boolean;
  toggleLang: () => void;
  dir: "rtl" | "ltr";
}

const AdminLangContext = createContext<AdminLangContextValue>({
  lang: "ar",
  setLang: () => {},
  t: (ar) => ar,
  isRTL: true,
  toggleLang: () => {},
  dir: "rtl",
});

export function AdminLanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem("akseer_admin_lang") as Lang) || "ar";
  });

  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
    document.documentElement.style.fontFamily =
      lang === "ar" ? "'Cairo', 'Tajawal', sans-serif" : "'Inter', sans-serif";
  }, [lang, dir]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("akseer_admin_lang", l);
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === "ar" ? "en" : "ar");
  }, [lang, setLang]);

  const t = useCallback((ar: string, en: string) => (lang === "ar" ? ar : en), [lang]);

  return (
    <AdminLangContext.Provider value={{ lang, setLang, t, isRTL: lang === "ar", toggleLang, dir }}>
      {children}
    </AdminLangContext.Provider>
  );
}

export function useAdminLang() {
  return useContext(AdminLangContext);
}
