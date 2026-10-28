import { BookOpen, Home, Library, Play, Search } from 'lucide-react';
import type { CSSProperties } from 'react';
import { APP_CONFIG, themeCssVars, verseOfTheDay, type ThemeMode, type ThemePreset } from '@gracetunes/shared';

function MiniCover({ hue, className = '' }: { hue: number; className?: string }) {
  return (
    <div
      className={`preview-cover rounded-lg ${className}`}
      style={{
        background: `radial-gradient(120% 90% at 85% 10%, hsl(${(hue + 48) % 360} 90% 65% / .85), transparent 55%), linear-gradient(150deg, hsl(${hue} 72% 46%), hsl(${hue} 70% 18%))`,
      }}
    />
  );
}

/** A scaled-down mock of the listener app, rendered with the given preset's tokens. */
export function ThemePreview({ theme, mode }: { theme: ThemePreset; mode: ThemeMode }) {
  const verse = verseOfTheDay();
  const vars = themeCssVars(theme, mode) as CSSProperties;
  const heading = { fontFamily: 'var(--app-font-heading)' };

  return (
    <div
      style={vars}
      className="overflow-hidden rounded-2xl border border-t-line bg-t-bg text-t-fg shadow-2xl"
      aria-label={`${theme.name} preview, ${mode} mode`}
    >
      <div className="flex h-[300px] gap-2 p-2 text-[11px]" style={{ fontFamily: 'var(--app-font-sans)', background: `radial-gradient(30rem 20rem at 0% 0%, var(--glow-a), transparent 60%), radial-gradient(25rem 15rem at 100% 0%, var(--glow-b), transparent 60%)` }}>
        <div className="flex w-28 shrink-0 flex-col gap-1 rounded-xl border border-t-line bg-t-surface p-2.5">
          <p className="mb-2 text-xs font-extrabold" style={heading}>
            Grace<span className="text-t-highlight">Tunes</span>
          </p>
          {[
            [Home, 'Home', true],
            [Search, 'Search', false],
            [Library, 'Library', false],
          ].map(([Icon, label, active]) => {
            const I = Icon as typeof Home;
            return (
              <span key={label as string} className={`flex items-center gap-2 rounded-md px-1.5 py-1 font-semibold ${active ? 'bg-t-surface text-t-fg' : 'text-t-muted'}`}>
                <I size={12} className={active ? 'text-t-highlight' : ''} /> {label as string}
              </span>
            );
          })}
        </div>

        <div className="min-w-0 flex-1 space-y-2.5 overflow-hidden rounded-xl border border-t-line bg-t-surface p-3">
          <p className="text-[9px] font-bold tracking-wider text-t-highlight uppercase">Good evening</p>
          <p className="-mt-1.5 text-sm font-extrabold" style={heading}>
            What will you worship to today?
          </p>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-t-hero-from to-t-hero-to p-3 text-white">
            <p className="flex items-center gap-1 text-[8px] font-bold tracking-widest text-t-highlight uppercase">
              <BookOpen size={9} /> Verse of the day
            </p>
            <p className="mt-1.5 line-clamp-2 text-[12px] leading-snug" style={{ fontFamily: 'var(--app-font-display)' }}>
              “{verse.text}”
            </p>
          </div>
          <div className="flex gap-2">
            {[210, 340, 40].map((h) => (
              <div key={h} className="w-1/3">
                <MiniCover hue={h} className="aspect-square w-full" />
                <p className="mt-1 truncate font-semibold">Sunrise Worship</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="preview-glass flex items-center gap-3 border-t border-t-line px-3 py-2 text-[11px]" style={{ fontFamily: 'var(--app-font-sans)' }}>
        <MiniCover hue={205} className="h-8 w-8" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">Morning Mercies</p>
          <p className="truncate text-t-muted">Selah Rivers</p>
        </div>
        <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-t-highlight to-t-highlight-strong text-t-on-highlight">
          <Play size={12} fill="currentColor" />
        </span>
        <div className="hidden h-1 w-24 overflow-hidden rounded-full bg-t-line sm:block">
          <div className="h-full w-2/5 bg-t-fg" />
        </div>
      </div>
      <p className="sr-only">{APP_CONFIG.name}</p>
    </div>
  );
}
