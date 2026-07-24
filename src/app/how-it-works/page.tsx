// src/app/how-it-works/page.tsx

import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export default async function HowItWorksPage() {
  const t = await getTranslations('HowItWorks');

  const steps = [
    { title: t('step1Title'), body: t('step1Body') },
    { title: t('step2Title'), body: t('step2Body') },
    { title: t('step3Title'), body: t('step3Body') },
    { title: t('step4Title'), body: t('step4Body') },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">{t('title')}</h1>
        <div className="space-y-6">
          {steps.map((step, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-3">{step.title}</h2>
              <p>{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

