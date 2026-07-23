// src/app/for-managers/page.tsx

import Link from 'next/link';
import { Calendar, TrendingUp, Users, Clock, ShieldCheck, BarChart3 } from 'lucide-react';

export default function ForManagersPage() {
  return (
    <div className="min-h-screen bg-brand-stone">

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 py-16 sm:py-20 text-center">
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-brand-ink leading-tight mb-5">
          Turn window-shoppers into <span className="text-brand-gold italic">booked visits</span>.
        </h1>
        <p className="text-brand-inksoft font-sans text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
          Bondoutfit lets your customers book a fitting appointment at your store online —
          and get a discount when they show up and buy. Fewer wasted visits, more traffic
          on quiet days, and a simple dashboard to manage it all.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/auth/store/signup"
            className="bg-brand-ink hover:bg-brand-golddeep text-white px-8 py-3 rounded-lg font-serif font-semibold transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/how-it-works"
            className="border border-brand-stoneborder text-brand-ink px-8 py-3 rounded-lg font-serif font-semibold hover:bg-brand-paper transition-colors"
          >
            See How It Works
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-brand-ink text-center mb-10">
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: Users, title: 'Customer finds your store', body: 'They browse your collections and available slots on Bondoutfit.' },
            { icon: Calendar, title: 'They book a time', body: "A visit is scheduled directly into your store's calendar — no back-and-forth." },
            { icon: Clock, title: "You're ready for them", body: 'You know who is coming and when, so you can prepare and greet them properly.' },
            { icon: TrendingUp, title: 'They visit and buy', body: 'On arrival, they unlock a discount to use on their purchase — encouraging them to actually buy.' },
          ].map((step, i) => (
            <div key={i} className="bg-brand-paper border border-brand-stoneborder rounded-xl p-5 text-center">
              <step.icon className="h-8 w-8 text-brand-gold mx-auto mb-3" />
              <div className="text-xs font-sans font-semibold text-brand-gold mb-1">STEP {i + 1}</div>
              <h3 className="font-serif font-semibold text-brand-ink mb-2">{step.title}</h3>
              <p className="text-sm text-brand-inksoft font-sans leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-brand-ink text-center mb-10">
          Why store owners choose Bondoutfit
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { icon: TrendingUp, title: 'More foot traffic on quiet days', body: 'Discounts pull customers in specifically when you need them, not just at peak hours.' },
            { icon: ShieldCheck, title: 'Fewer wasted visits', body: 'Customers who book in advance are far more likely to show up and buy — no more guessing who\'s serious.' },
            { icon: BarChart3, title: 'A simple dashboard', body: 'Manage your schedule, discounts, and items from one place — no complicated setup.' },
            { icon: Clock, title: 'You stay in control', body: 'You decide the discount, the hours, and the items — Bondoutfit just brings the bookings.' },
          ].map((b, i) => (
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

      {/* Try the demo */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-brand-ink rounded-2xl p-8 text-center">
          <h2 className="font-serif text-2xl font-semibold text-white mb-3">See it for yourself</h2>
          <p className="text-brand-stone font-sans mb-6 max-w-xl mx-auto leading-relaxed">
            Try Bondoutfit as both a store owner and a customer, using our live demo store —
            no signup required.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-xs font-sans font-semibold text-brand-gold uppercase tracking-wide mb-2">
                Try it as store owner
              </div>
              <div className="text-sm text-white font-sans">user: horistics@outlook.com</div>
              <div className="text-sm text-white font-sans">pass: goforit456.</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-xs font-sans font-semibold text-brand-gold uppercase tracking-wide mb-2">
                Try it as a customer
              </div>
              <div className="text-sm text-white font-sans">user: horistics@gmail.com</div>
              <div className="text-sm text-white font-sans">pass: goforit123.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-brand-ink mb-4">
          Ready to fill more appointments?
        </h2>
        <p className="text-brand-inksoft font-sans mb-8">
          Setting up your store takes a few minutes — and I'm happy to walk you through it personally.
        </p>
        <Link
          href="/auth/store/signup"
          className="bg-brand-ink hover:bg-brand-golddeep text-white px-10 py-4 rounded-lg font-serif font-semibold text-lg transition-colors inline-block"
        >
          Sign Up Your Store
        </Link>
        <p className="text-sm text-brand-inksoft font-sans mt-6">
          Or reach out directly — Isidoros Parlamas · mind@horistics.com · +45 27 13 44 83
        </p>
      </section>

    </div>
  );
}