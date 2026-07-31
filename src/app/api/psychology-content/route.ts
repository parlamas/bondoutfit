//src/app/api/psychology-content/route.ts

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { locales } from '@/i18n/request';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const requested = searchParams.get('locale') || 'en';
  const locale = (locales as readonly string[]).includes(requested) ? requested : 'en';

  try {
    const filePath = path.join(process.cwd(), 'messages', `${locale}.json`);
    const raw = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(raw);

    if (data.Psychology) {
      return NextResponse.json({ locale, content: data.Psychology });
    }

    // Fall back to English if this locale doesn't have Psychology content yet
    const enPath = path.join(process.cwd(), 'messages', 'en.json');
    const enRaw = await fs.readFile(enPath, 'utf-8');
    const enData = JSON.parse(enRaw);
    return NextResponse.json({ locale: 'en', content: enData.Psychology, fallback: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load content' }, { status: 500 });
  }
}