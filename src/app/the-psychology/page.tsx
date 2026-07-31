//src/app/the-psychology/page.tsx

'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import PsychologyLanguageSwitcher from '@/components/PsychologyLanguageSwitcher';

function getCookieLocale(): string {
  if (typeof document === 'undefined') return 'en';
  const match = document.cookie.match(/psychLocale=([^;]+)/);
  return match ? match[1] : 'en';
}

export default function ThePsychologyPage() {
  const [locale, setLocale] = useState('en');
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    setLocale(getCookieLocale());
  }, []);

  useEffect(() => {
    fetch(`/api/psychology-content?locale=${locale}`)
      .then(res => res.json())
      .then(data => setContent(data.content))
      .catch(() => setContent(null));
  }, [locale]);

  if (!content) {
    return <div className="min-h-screen flex items-center justify-center text-brand-ink">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-brand-stone py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-end mb-6">
          <PsychologyLanguageSwitcher value={locale} onChange={setLocale} />
        </div>

        <div className="bg-brand-paper rounded-2xl p-8 sm:p-12">
          <div className="text-xs font-bold tracking-widest text-brand-gold uppercase mb-2">Bondoutfit</div>
          <div className="w-16 h-1 bg-brand-gold mb-6"></div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-ink leading-tight mb-2">
            {content.headlineStart}<br />
            <span className="text-brand-gold italic">{content.headlineAccent}</span>
          </h1>
          <p className="italic text-brand-inksoft mb-8">{content.heroLine}</p>

          <div className="prose prose-neutral max-w-none text-brand-inksoft leading-relaxed space-y-4">
            <p className="text-lg">{content.lede}</p>
            <p>{content.para2}</p>
            <p>{content.para3}</p>

            <div className="border-l-4 border-brand-gold pl-4 my-6">
              <div className="text-xs font-bold uppercase tracking-wide text-brand-gold mb-2">{content.shiftOneLabel}</div>
              <p>{content.shiftOnePara1}</p>
              <p>{content.shiftOnePara2}</p>
            </div>

            <div className="bg-brand-stone rounded-xl p-6 my-6">
              <div className="text-xs font-bold uppercase tracking-wide text-brand-ink mb-2">{content.shiftTwoLabel}</div>
              <p>{content.shiftTwoPara1}</p>
              <p>{content.shiftTwoPara2}</p>
            </div>

            <p>{content.closing}</p>
          </div>

          <hr className="my-8 border-brand-stoneborder" />

          <h2 className="font-sans text-sm font-bold uppercase tracking-wide text-brand-gold mb-4">{content.howItWorksTitle}</h2>
          <div className="space-y-4 mb-8">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="flex gap-3">
                <div className="w-7 h-7 rounded-full border border-brand-gold text-brand-gold flex items-center justify-center text-sm flex-shrink-0">{n}</div>
                <div>
                  <div className="font-semibold text-brand-ink">{content[`step${n}Title`]}</div>
                  <div className="text-sm text-brand-inksoft">{content[`step${n}Body`]}</div>
                </div>
              </div>
            ))}
          </div>

          <h2 className="font-sans text-sm font-bold uppercase tracking-wide text-brand-gold mb-2">{content.seeForYourself}</h2>
          <p className="text-sm text-brand-inksoft mb-4">{content.demoNote}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-white border border-brand-stoneborder rounded-lg p-4">
              <div className="text-xs font-bold uppercase text-brand-gold mb-2">{content.tryOwnerLabel}</div>
              <div className="text-sm">user: <span className="text-cyan-700 font-semibold">horistics@outlook.com</span></div>
              <div className="text-sm">code: <span className="text-cyan-700 font-semibold">goforit456.</span></div>
            </div>
            <div className="bg-white border border-brand-stoneborder rounded-lg p-4">
              <div className="text-xs font-bold uppercase text-brand-gold mb-2">{content.tryCustomerLabel}</div>
              <div className="text-sm">user: <span className="text-cyan-700 font-semibold">horistics@gmail.com</span></div>
              <div className="text-sm">code: <span className="text-cyan-700 font-semibold">goforit123.</span></div>
            </div>
          </div>

          <p className="text-sm text-brand-inksoft mb-1">{content.scanBody}</p>
          <p className="text-sm text-brand-gold">Isidoros Parlamas · mind@horistics.com · +45 27 13 44 83</p>

          <div className="mt-8 text-xs text-brand-inksoft border-t border-brand-stoneborder pt-4">{content.footer}</div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-brand-gold hover:underline">← Back to Bondoutfit</Link>
        </div>
      </div>
    </div>
  );
}