import { Check, Crown, Download, Headphones, SkipForward, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { APP_CONFIG } from '@gracetunes/shared';

const PERKS = [
  { icon: Sparkles, title: 'Ad-free worship', text: 'No audio ads between songs or sermons.' },
  { icon: Download, title: 'Offline downloads', text: 'Take your playlists on the road, encrypted on your phone.' },
  { icon: Headphones, title: 'Studio quality', text: 'Stream at up to 256 kbps.' },
  { icon: SkipForward, title: 'Unlimited skips', text: 'Play any song, in any order.' },
];

// Prices mirror the seeded Plan rows; Phase 9 loads them from the API.
const PLANS = [
  { code: 'free', name: 'Free', inr: 0, usd: 0, period: '', features: ['Ad-supported listening', '6 skips per hour', 'Standard quality (128 kbps)'] },
  { code: 'premium_monthly', name: 'Premium', inr: 99, usd: 4.99, period: '/ month', features: ['Ad-free', 'Offline downloads', 'High quality (256 kbps)', 'Unlimited skips'], highlight: true },
  { code: 'premium_yearly', name: 'Premium Yearly', inr: 999, usd: 49.99, period: '/ year', features: ['Everything in Premium', '2 months free', 'Family sharing (coming soon)'] },
];

export function Premium() {
  const [currency, setCurrency] = useState<'inr' | 'usd'>('inr');

  return (
    <div className="pb-12">
      <header className="relative overflow-hidden px-4 pt-14 pb-12 text-center md:px-8">
        <div aria-hidden className="absolute top-0 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-highlight/20 blur-3xl" />
        <div className="relative animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-highlight/30 bg-highlight/10 px-4 py-1.5 text-sm font-bold text-highlight">
            <Crown size={15} /> {APP_CONFIG.name} Premium
          </span>
          <h1 className="mx-auto mt-5 max-w-2xl text-4xl font-extrabold tracking-tight md:text-5xl">
            Uninterrupted worship, <span className="font-display font-semibold text-highlight italic">wherever you are</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-muted">
            Support Christian artists and enjoy every song ad-free, offline and in the best quality.
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-4 px-4 sm:grid-cols-2 md:px-8 lg:grid-cols-4">
        {PERKS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-2xl border border-line bg-surface p-5">
            <Icon className="text-highlight" size={22} />
            <p className="mt-3 font-bold">{title}</p>
            <p className="mt-1 text-sm text-muted">{text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <div className="flex rounded-full bg-surface p-1 text-sm font-semibold">
          {(['inr', 'usd'] as const).map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={currency === c}
              onClick={() => setCurrency(c)}
              className={`rounded-full px-4 py-1.5 transition ${currency === c ? 'bg-fg text-bg' : 'text-muted'}`}
            >
              {c === 'inr' ? '₹ India (Razorpay)' : '$ International (Stripe)'}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-8 grid max-w-5xl gap-5 px-4 md:grid-cols-3 md:px-8">
        {PLANS.map((p) => (
          <div
            key={p.code}
            className={`relative flex flex-col rounded-3xl border p-6 ${p.highlight ? 'border-highlight/50 bg-gradient-to-b from-highlight/15 to-transparent shadow-2xl shadow-highlight/10' : 'border-line bg-surface'}`}
          >
            {p.highlight && (
              <span className="absolute -top-3 left-6 rounded-full bg-highlight px-3 py-0.5 text-xs font-bold text-on-highlight">
                Most popular
              </span>
            )}
            <p className="font-bold">{p.name}</p>
            <p className="mt-3">
              <span className="text-4xl font-extrabold">
                {p.inr === 0 ? 'Free' : currency === 'inr' ? `₹${p.inr}` : `$${p.usd}`}
              </span>
              <span className="text-muted"> {p.period}</span>
            </p>
            <ul className="mt-6 flex-1 space-y-2.5 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <Check size={17} className="shrink-0 text-highlight" /> {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              disabled
              title="Payments arrive in Phase 9"
              className={`mt-8 rounded-full py-3 font-bold transition disabled:cursor-not-allowed disabled:opacity-70 ${p.highlight ? 'bg-highlight text-on-highlight' : 'bg-fg text-bg'}`}
            >
              {p.inr === 0 ? 'Current plan' : 'Coming soon'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
