// src/app/for-managers/page.tsx

import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Calendar, TrendingUp, Users, Clock, ShieldCheck, BarChart3 } from 'lucide-react';

export default async function ForManagersPage() {
  const t = await getTranslations('ForManagers');

  const steps = [
    { icon: Users, title: t('step1Title'), body: t('step1Body') },
    { icon: Calendar, title: t('step2Title'), body: t('step2Body') },
    { icon: Clock, title: t('step3Title'), body: t('step3Body') },
    { icon: TrendingUp, title: t('step4Title'), body: t('step4Body') },
  ];

  const benefits = [
    { icon: TrendingUp, title: t('benefit1Title'), body: t('benefit1Body') },
    { icon: ShieldCheck, title: t('benefit2Title'), body: t('benefit2Body') },
    { icon: BarChart3, title: t('benefit3Title'), body: t('benefit3Body') },
    { icon: Clock, title: t('benefit4Title'), body: t('benefit4Body') },
  ];

  return (
    <div className="min-h-screen bg-brand-stone">

      <section className="max-w-4xl mx-auto px-4 py-16 sm:py-20 text-center">
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-brand-ink leading-tight mb-5">
          {t('heroTitleStart')} <span className="text-brand-gold italic">{t('heroTitleAccent')}</span>.
        </h1>
        <p className="text-brand-inksoft font-sans text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
          {t('heroBody')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/auth/store/signup" className="bg-brand-ink hover:bg-brand-golddeep text-white px-8 py-3 rounded-lg font-serif font-semibold transition-colors">
            {t('getStarted')}
          </Link>
          <Link href="/how-it-works" className="border border-brand-stoneborder text-brand-ink px-8 py-3 rounded-lg font-serif font-semibold hover:bg-brand-paper transition-colors">
            {t('seeHowItWorks')}
          </Link>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-brand-ink text-center mb-10">
          {t('howItWorksTitle')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="bg-brand-paper border border-brand-stoneborder rounded-xl p-5 text-center">
              <step.icon className="h-8 w-8 text-brand-gold mx-auto mb-3" />
              <div className="text-xs font-sans font-semibold text-brand-gold mb-1">STEP {i + 1}</div>
              <h3 className="font-serif font-semibold text-brand-ink mb-2">{step.title}</h3>
              <p className="text-sm text-brand-inksoft font-sans leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-brand-ink text-center mb-10">
          {t('whyTitle')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {benefits.map((b, i) => (
            <div key={i} className="flex items-start gap-4 bg-brand-paper border border-brand-stoneborder rounded-xl p-5">
              <b.icon className="h-7 w-7 text-brand-gold flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-serif font-semibold text-brand-ink mb-1">{b.title}</h3>
                <p className="text-sm text-brand-inksoft font-sans leading-relaxed">{b.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-brand-ink rounded-2xl p-8 text-center">
          <h2 className="font-serif text-2xl font-semibold text-white mb-3">{t('demoTitle')}</h2>
          <p className="text-brand-stone font-sans mb-6 max-w-xl mx-auto leading-relaxed">
            {t('demoBody')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-xs font-sans font-semibold text-brand-gold uppercase tracking-wide mb-2">
                {t('tryOwnerLabel')}
              </div>
              <div className="text-sm text-white font-sans">user: horistics@outlook.com</div>
              <div className="text-sm text-white font-sans">pass: goforit456.</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-xs font-sans font-semibold text-brand-gold uppercase tracking-wide mb-2">
                {t('tryCustomerLabel')}
              </div>
              <div className="text-sm text-white font-sans">user: horistics@gmail.com</div>
              <div className="text-sm text-white font-sans">pass: goforit123.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-brand-ink mb-4">
          {t('finalCtaTitle')}
        </h2>
        <p className="text-brand-inksoft font-sans mb-8">
          {t('finalCtaBody')}
        </p>
        <Link href="/auth/store/signup" className="bg-brand-ink hover:bg-brand-golddeep text-white px-10 py-4 rounded-lg font-serif font-semibold text-lg transition-colors inline-block">
          {t('signUpCta')}
        </Link>
        <p className="text-sm text-brand-inksoft font-sans mt-6">
          {t('orReachOut')} — Isidoros Parlamas · mind@horistics.com · +45 27 13 44 83
        </p>
      </section>

    </div>
  );
}


