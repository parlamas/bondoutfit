import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export const locales = [
  'en', 'el', 'es', 'pt', 'it', 'fr', 'de', 'nl', 'da', 'no',
  'sv', 'fi', 'is', 'et', 'lv', 'lt', 'pl', 'cs', 'sk', 'hu',
  'sl', 'ro', 'sr', 'hr', 'bg', 'sq', 'uk', 'ru', 'ka', 'tr',
  'ja', 'ko', 'zh', 'hi', 'ms', 'id', 'tl', 'he', 'ar', 'fa',
] as const;
export const defaultLocale = 'en';

export default getRequestConfig(async () => {
  const cookieStore = cookies();
  const cookieLocale = cookieStore.get('locale')?.value;
  const locale = locales.includes(cookieLocale as any) ? cookieLocale! : defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});