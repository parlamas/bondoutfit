//src/components/HeaderControls.tsx

'use client';
import { usePathname } from 'next/navigation';
import LanguageSwitcher from './LanguageSwitcher';

export default function HeaderControls() {
  const pathname = usePathname();
  const onPsychologyPage = pathname === '/the-psychology';
  const onConceptPage = pathname === '/';

  return (
    <div className="flex items-center justify-end gap-4 px-4 py-2 border-b flex-wrap">
      <span className="text-xs text-brand-inksoft">Horistics CVR 43109324</span>
      
        <a href="/the-psychology"
        className={
          onPsychologyPage
            ? "text-xs font-bold text-brand-ink underline underline-offset-4 decoration-2 decoration-brand-gold mr-2"
            : "text-xs text-brand-gold hover:underline mr-2"
        }
      >
        The Psychology
      </a>
      
        <a href="/"
        className={
          onConceptPage
            ? "text-xs font-bold text-brand-ink underline underline-offset-4 decoration-2 decoration-brand-gold mr-2"
            : "text-xs text-brand-gold hover:underline mr-2"
        }
      >
        The Concept
      </a>
      {!onPsychologyPage && (
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-brand-inksoft leading-tight">40 languages</span>
          <LanguageSwitcher />
        </div>
      )}
    </div>
  );
}