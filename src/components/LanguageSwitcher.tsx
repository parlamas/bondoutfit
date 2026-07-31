//src/components/LanguageSwitcher.tsx

'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { flagUrl } from '@/lib/language-flags';

const LANGUAGES: { code: string; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'el', label: 'Ελληνικά' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' },
  { code: 'it', label: 'Italiano' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'da', label: 'Dansk' },
  { code: 'no', label: 'Norsk' },
  { code: 'sv', label: 'Svenska' },
  { code: 'fi', label: 'Suomi' },
  { code: 'is', label: 'Íslenska' },
  { code: 'et', label: 'Eesti' },
  { code: 'lv', label: 'Latviešu' },
  { code: 'lt', label: 'Lietuvių' },
  { code: 'pl', label: 'Polski' },
  { code: 'cs', label: 'Čeština' },
  { code: 'sk', label: 'Slovenčina' },
  { code: 'hu', label: 'Magyar' },
  { code: 'sl', label: 'Slovenščina' },
  { code: 'ro', label: 'Română' },
  { code: 'sr', label: 'Српски' },
  { code: 'hr', label: 'Hrvatski' },
  { code: 'bg', label: 'Български' },
  { code: 'sq', label: 'Shqip' },
  { code: 'uk', label: 'Українська' },
  { code: 'ru', label: 'Русский' },
  { code: 'ka', label: 'ქართული' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'zh', label: '中文' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ms', label: 'Bahasa Melayu' },
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'tl', label: 'Tagalog' },
  { code: 'he', label: 'עברית' },
  { code: 'ar', label: 'العربية' },
  { code: 'fa', label: 'فارسی' },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find(l => l.code === locale) ?? LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function selectLanguage(code: string) {
    document.cookie = `locale=${code};path=/;max-age=${60 * 60 * 24 * 365}`;
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm border border-brand-stoneborder rounded-md px-2 py-1 bg-white text-brand-ink hover:bg-brand-paper"
      >
        <img src={flagUrl(current.code, 20)} alt="" className="w-5 h-auto" />
        <span>{current.label}</span>
        <span className="text-xs">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-56 max-h-80 overflow-y-auto bg-white border border-brand-stoneborder rounded-md shadow-lg z-50">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => selectLanguage(l.code)}
              className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm hover:bg-brand-paper ${l.code === locale ? 'bg-brand-paper font-semibold' : ''}`}
            >
              <img src={flagUrl(l.code, 20)} alt="" className="w-5 h-auto" />
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


