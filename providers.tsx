"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import React, { ReactNode, useState, useEffect } from "react";
import { getMessages, getDefaultLocale, Locale } from "@/lib/i18n";
import { LocaleContext } from "@/lib/LocaleContext";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [locale, setLocale] = useState<Locale>("en");
  const [messages, setMessages] = useState<any>(null);

  useEffect(() => {
    const currentLocale = getDefaultLocale();
    setLocale(currentLocale);
    setMessages(getMessages(currentLocale));
  }, []);

  useEffect(() => {
    if (!locale) return;
    localStorage.setItem("locale", locale);
    setMessages(getMessages(locale));
  }, [locale]);

  if (!messages) return null; // or loading spinner

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <QueryClientProvider client={queryClient}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </QueryClientProvider>
    </LocaleContext.Provider>
  );
}
