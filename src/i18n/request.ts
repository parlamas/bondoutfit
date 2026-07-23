import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export const locales = ['en', 'da', 'es', 'el', 'pt', 'pl'] as const;
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