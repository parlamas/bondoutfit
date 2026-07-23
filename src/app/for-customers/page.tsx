// src/app/for-customers/page.tsx

import Link from 'next/link';
import { Calendar, Percent, Clock, Sparkles, ShoppingBag, ThumbsUp } from 'lucide-react';

export default function ForCustomersPage() {
  return (
    <div className="min-h-screen bg-brand-stone">

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 py-16 sm:py-20 text-center">
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-brand-ink leading-tight mb-5">
          Book ahead. <span className="text-brand-gold italic">Get rewarded.</span>
        </h1>
        <p className="text-brand-inksoft font-sans text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
          With Bondoutfit, you book a fitting appointment at your favorite stores online —
          and get a discount when you show up and buy. No waiting, no uncertainty, better prices.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="bg-brand-ink hover:bg-brand-golddeep text-white px-8 py-3 rounded-lg font-serif font-semibold transition-colors"
          >
            Find a Store
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
            { icon: ShoppingBag, title: 'Find a store', body: 'Browse stores near you and see what they offer on Bondoutfit.' },
            { icon: Calendar, title: 'Book a time', body: 'Pick a date and time that works for you — no calls, no back-and-forth.' },
            { icon: Clock, title: 'Show up', body: 'Arrive at your scheduled time — the store is expecting you.' },
            { icon: Percent, title: 'Get your discount', body: 'Make a purchase and unlock the pre-agreed discount, automatically.' },
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
          Why shoppers love it
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { icon: Percent, title: 'Better prices', body: 'Booking ahead earns you a discount you wouldn\'t get by just walking in.' },
            { icon: Clock, title: 'No waiting', body: 'Your visit is scheduled, so you\'re not standing around hoping someone\'s free to help.' },
            { icon: ThumbsUp, title: 'No pressure', body: 'The store already knows you\'re coming, so you get proper attention from the moment you arrive.' },
            { icon: Sparkles, title: 'Simple and free', body: 'Booking costs nothing — you only benefit when you actually visit and buy.' },
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

      {/* Final CTA */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-brand-ink mb-4">
          Ready to book your first visit?
        </h2>
        <p className="text-brand-inksoft font-sans mb-8">
          Find a store near you and reserve a time that works for you.
        </p>
        <Link
          href="/"
          className="bg-brand-ink hover:bg-brand-golddeep text-white px-10 py-4 rounded-lg font-serif font-semibold text-lg transition-colors inline-block"
        >
          Find a Store
        </Link>
      </section>

    </div>
  );
}