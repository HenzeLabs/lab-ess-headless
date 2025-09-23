'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Translation,
  Locale,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  getLocaleByCode,
  detectBrowserLocale,
} from './config';

interface I18nContextValue {
  locale: string;
  localeData: Locale;
  translations: Translation;
  setLocale: (locale: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatNumber: (value: number) => string;
  formatCurrency: (value: number) => string;
  formatDate: (date: Date) => string;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

interface I18nProviderProps {
  children: React.ReactNode;
  initialLocale?: string;
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<string>(
    initialLocale || DEFAULT_LOCALE,
  );
  const [translations, setTranslations] = useState<Translation>({});
  const [isLoading, setIsLoading] = useState(true);

  const localeData =
    getLocaleByCode(locale) || getLocaleByCode(DEFAULT_LOCALE)!;

  useEffect(() => {
    loadTranslations(locale);
  }, [locale]);

  useEffect(() => {
    // Auto-detect locale on client side if not provided
    if (!initialLocale && typeof window !== 'undefined') {
      const detectedLocale = detectBrowserLocale();
      const savedLocale = localStorage.getItem('lab-essentials-locale');
      const preferredLocale = savedLocale || detectedLocale;

      if (preferredLocale !== locale) {
        setLocaleState(preferredLocale);
      }
    }
  }, [initialLocale, locale]);

  const loadTranslations = async (targetLocale: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/translations/${targetLocale}`);
      if (response.ok) {
        const data = await response.json();
        setTranslations(data);
      } else {
        // Fallback to default locale
        if (targetLocale !== DEFAULT_LOCALE) {
          const fallbackResponse = await fetch(
            `/api/translations/${DEFAULT_LOCALE}`,
          );
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            setTranslations(fallbackData);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load translations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setLocale = (newLocale: string) => {
    if (
      newLocale !== locale &&
      SUPPORTED_LOCALES.some((l) => l.code === newLocale)
    ) {
      setLocaleState(newLocale);
      if (typeof window !== 'undefined') {
        localStorage.setItem('lab-essentials-locale', newLocale);
      }
    }
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: Translation | string = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key as fallback
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Replace parameters
    if (params) {
      return Object.entries(params).reduce(
        (str, [param, val]) =>
          str.replace(new RegExp(`{{${param}}}`, 'g'), String(val)),
        value,
      );
    }

    return value;
  };

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat(locale, localeData.numberFormat).format(value);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: localeData.currency,
    }).format(value);
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat(locale).format(date);
  };

  const contextValue: I18nContextValue = {
    locale,
    localeData,
    translations,
    setLocale,
    t,
    formatNumber,
    formatCurrency,
    formatDate,
    isLoading,
  };

  return (
    <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Hook for translation only
export function useTranslation() {
  const { t, locale, isLoading } = useI18n();
  return { t, locale, isLoading };
}

// Hook for formatting
export function useFormatting() {
  const { formatNumber, formatCurrency, formatDate, locale } = useI18n();
  return { formatNumber, formatCurrency, formatDate, locale };
}
