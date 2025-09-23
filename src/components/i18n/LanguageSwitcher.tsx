'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n/context';
import { SUPPORTED_LOCALES } from '@/lib/i18n/config';
import { ChevronDown } from 'lucide-react';

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { locale, setLocale, localeData } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const handleLocaleChange = (newLocale: string) => {
    setLocale(newLocale);
    setIsOpen(false);

    // Update URL to include locale (you might want to use Next.js router for this)
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const search = window.location.search;
      const newPath = newLocale === 'en' ? path : `/${newLocale}${path}`;
      window.history.pushState(null, '', newPath + search);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Language selector"
      >
        <span className="text-base">{localeData.flag}</span>
        <span className="text-sm font-medium">{localeData.name}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--bg))] shadow-lg">
            <div className="py-2">
              {SUPPORTED_LOCALES.map((supportedLocale) => (
                <button
                  key={supportedLocale.code}
                  onClick={() => handleLocaleChange(supportedLocale.code)}
                  className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-[hsl(var(--muted))] ${
                    locale === supportedLocale.code
                      ? 'bg-[hsl(var(--muted))] font-medium text-[hsl(var(--brand))]'
                      : 'text-[hsl(var(--ink))]'
                  }`}
                  role="menuitem"
                >
                  <span className="text-base">{supportedLocale.flag}</span>
                  <div className="flex flex-col">
                    <span>{supportedLocale.name}</span>
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">
                      {supportedLocale.currency}
                    </span>
                  </div>
                  {locale === supportedLocale.code && (
                    <span className="ml-auto text-[hsl(var(--brand))]">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Compact version for mobile/header
export function CompactLanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { locale, setLocale, localeData } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const handleLocaleChange = (newLocale: string) => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1"
        aria-label="Language selector"
      >
        <span className="text-lg">{localeData.flag}</span>
        <ChevronDown className="h-3 w-3" />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div className="absolute right-0 top-full z-20 mt-1 w-32 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--bg))] shadow-lg">
            <div className="py-1">
              {SUPPORTED_LOCALES.map((supportedLocale) => (
                <button
                  key={supportedLocale.code}
                  onClick={() => handleLocaleChange(supportedLocale.code)}
                  className={`flex w-full items-center gap-2 px-3 py-1 text-left text-sm hover:bg-[hsl(var(--muted))] ${
                    locale === supportedLocale.code
                      ? 'bg-[hsl(var(--muted))] text-[hsl(var(--brand))]'
                      : 'text-[hsl(var(--ink))]'
                  }`}
                >
                  <span>{supportedLocale.flag}</span>
                  <span className="text-xs">
                    {supportedLocale.code.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
