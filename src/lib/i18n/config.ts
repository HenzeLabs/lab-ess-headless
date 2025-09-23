export interface Translation {
  [key: string]: string | Translation;
}

export interface Locale {
  code: string;
  name: string;
  flag: string;
  direction: 'ltr' | 'rtl';
  currency: string;
  dateFormat: string;
  numberFormat: Intl.NumberFormatOptions;
}

export const SUPPORTED_LOCALES: Locale[] = [
  {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    direction: 'ltr',
    currency: 'USD',
    dateFormat: 'MM/dd/yyyy',
    numberFormat: { style: 'decimal', minimumFractionDigits: 2 },
  },
  {
    code: 'es',
    name: 'Español',
    flag: '🇪🇸',
    direction: 'ltr',
    currency: 'EUR',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: { style: 'decimal', minimumFractionDigits: 2 },
  },
  {
    code: 'fr',
    name: 'Français',
    flag: '🇫🇷',
    direction: 'ltr',
    currency: 'EUR',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: { style: 'decimal', minimumFractionDigits: 2 },
  },
  {
    code: 'de',
    name: 'Deutsch',
    flag: '🇩🇪',
    direction: 'ltr',
    currency: 'EUR',
    dateFormat: 'dd.MM.yyyy',
    numberFormat: { style: 'decimal', minimumFractionDigits: 2 },
  },
  {
    code: 'ja',
    name: '日本語',
    flag: '🇯🇵',
    direction: 'ltr',
    currency: 'JPY',
    dateFormat: 'yyyy/MM/dd',
    numberFormat: { style: 'decimal', minimumFractionDigits: 0 },
  },
];

export const DEFAULT_LOCALE = 'en';

export function isValidLocale(locale: string): locale is string {
  return SUPPORTED_LOCALES.some((l) => l.code === locale);
}

export function getLocaleByCode(code: string): Locale | undefined {
  return SUPPORTED_LOCALES.find((l) => l.code === code);
}

export function detectBrowserLocale(): string {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  const browserLanguage = navigator.language.toLowerCase();
  const languageCode = browserLanguage.split('-')[0];

  // Check if we support the full language code first
  if (isValidLocale(browserLanguage)) {
    return browserLanguage;
  }

  // Check if we support the base language code
  if (isValidLocale(languageCode)) {
    return languageCode;
  }

  return DEFAULT_LOCALE;
}

export function getLocalizedPath(path: string, locale: string): string {
  if (locale === DEFAULT_LOCALE) {
    return path;
  }
  return `/${locale}${path === '/' ? '' : path}`;
}

export function removeLocaleFromPath(path: string): {
  locale: string;
  path: string;
} {
  const segments = path.split('/').filter(Boolean);

  if (segments.length === 0) {
    return { locale: DEFAULT_LOCALE, path: '/' };
  }

  const possibleLocale = segments[0];
  if (isValidLocale(possibleLocale)) {
    const remainingPath = '/' + segments.slice(1).join('/');
    return { locale: possibleLocale, path: remainingPath || '/' };
  }

  return { locale: DEFAULT_LOCALE, path: path };
}
