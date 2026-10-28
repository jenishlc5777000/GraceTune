import { BookOpen, Share2 } from 'lucide-react';
import { useState } from 'react';
import { verseOfTheDay } from '@gracetunes/shared';

export function VerseCard() {
  const verse = verseOfTheDay();
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const text = `“${verse.text}” (${verse.reference})`;
    try {
      if (navigator.share) await navigator.share({ text });
      else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      // User dismissed the share sheet.
    }
  };

  return (
    <figure className="relative overflow-hidden rounded-3xl border border-highlight/20 bg-gradient-to-br from-hero-from to-hero-to p-6 text-white shadow-2xl shadow-black/30 md:p-8">
      <div aria-hidden className="absolute -top-20 -right-16 h-64 w-64 rounded-full bg-highlight/25 blur-3xl" />
      <div aria-hidden className="absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-accent/40 blur-3xl" />
      <div className="relative">
        <figcaption className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-highlight uppercase">
            <BookOpen size={15} /> Verse of the day
          </span>
          <button
            type="button"
            onClick={share}
            className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur transition hover:bg-white/20"
          >
            <Share2 size={13} /> {copied ? 'Copied' : 'Share'}
          </button>
        </figcaption>
        <blockquote className="mt-5 max-w-2xl font-display text-2xl leading-snug md:text-[1.75rem]">
          “{verse.text}”
        </blockquote>
        <p className="mt-4 font-semibold text-white/70">{verse.reference}</p>
      </div>
    </figure>
  );
}
