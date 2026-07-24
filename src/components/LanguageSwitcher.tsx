//src/components/LanguageSwitcher.tsx

'use client';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'da', label: 'Dansk' },
  { code: 'es', label: 'Español' },
  { code: 'el', label: 'Ελληνικά' },
  { code: 'pt', label: 'Português' },
  { code: 'pl', label: 'Polski' },
  { code: 'sv', label: 'Svenska' },
  { code: 'fi', label: 'Suomi' },
  { code: 'no', label: 'Norsk' },
  { code: 'is', label: 'Íslenska' },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const locale = useLocale();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    document.cookie = `locale=${e.target.value};path=/;max-age=${60 * 60 * 24 * 365}`;
    router.refresh();
  };

  return (
    <select
      value={locale}
      onChange={handleChange}
      className="text-sm border border-brand-stoneborder rounded-md px-2 py-1 bg-white text-brand-ink"
    >
      {LANGUAGES.map(l => (
        <option key={l.code} value={l.code}>{l.label}</option>
      ))}
    </select>
  );
}