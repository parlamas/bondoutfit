//src/components/HeaderControls.tsx

'use client';
import { usePathname } from 'next/navigation';
import LanguageSwitcher from './LanguageSwitcher';

export default function HeaderControls() {
  const pathname = usePathname();
  const onPsychologyPage = pathname === '/the-psychology';

  return (
    <div className="flex items-center justify-end gap-4 px-4 py-2 border-b flex-wrap">
      <span className="text-xs text-brand-inksoft">Horistics CVR 43109324</span>
      <a href="/" className="text-xs text-brand-gold hover:underline mr-2">The Concept</a>
      <a href="/the-psychology" className="text-xs text-brand-gold hover:underline mr-2">The Psychology →</a>
      {!onPsychologyPage && <LanguageSwitcher />}
    </div>
  );
}