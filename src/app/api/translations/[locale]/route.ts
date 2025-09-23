import { NextRequest, NextResponse } from 'next/server';
import { isValidLocale, DEFAULT_LOCALE } from '@/lib/i18n/config';
import fs from 'fs';
import path from 'path';

export async function GET(
  _request: NextRequest,
  { params }: { params: { locale: string } },
) {
  try {
    const locale = params.locale;

    // Validate locale
    if (!isValidLocale(locale)) {
      return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
    }

    // Try to load the requested locale
    const translationsPath = path.join(
      process.cwd(),
      'src/lib/i18n/translations',
      `${locale}.json`,
    );

    let translations;

    try {
      const fileContent = fs.readFileSync(translationsPath, 'utf8');
      translations = JSON.parse(fileContent);
    } catch (error) {
      // Fallback to default locale if requested locale file doesn't exist
      const defaultPath = path.join(
        process.cwd(),
        'src/lib/i18n/translations',
        `${DEFAULT_LOCALE}.json`,
      );

      try {
        const defaultContent = fs.readFileSync(defaultPath, 'utf8');
        translations = JSON.parse(defaultContent);
      } catch (fallbackError) {
        console.error('Failed to load translations:', fallbackError);
        return NextResponse.json(
          { error: 'Translation files not found' },
          { status: 404 },
        );
      }
    }

    // Set cache headers for translations
    const response = NextResponse.json(translations);
    response.headers.set(
      'Cache-Control',
      'public, max-age=3600, stale-while-revalidate=86400',
    );

    return response;
  } catch (error) {
    console.error('Error serving translations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
