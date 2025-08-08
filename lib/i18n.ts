// lib/i18n.ts
import en from '@/db/utils/messages/en.json';
import gu from '@/db/utils/messages/gu.json';

export type Locale = 'en' | 'gu';

export const messages = {
  en,
  gu
} as const;

export function getMessages(locale: Locale) {
  return messages[locale] || messages.en;
}

export function getDefaultLocale(): Locale {
  if (typeof window !== 'undefined') {
    return (localStorage.getItem('locale') as Locale) || 'en';
  }
  return 'en';
}
