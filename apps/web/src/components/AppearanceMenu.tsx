import { Check, Moon, Palette, Sun } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { THEMES } from '@gracetunes/shared';
import { useLibrary } from '../store/library';
import { useEffectiveTheme } from '../theme/useTheme';

/** Listener-facing mode/theme controls, shown only for options the admin has enabled. */
export function AppearanceMenu() {
  const { theme, mode, settings } = useEffectiveTheme();
  const setMode = useLibrary((s) => s.setMode);
  const userThemeId = useLibrary((s) => s.themeId);
  const setThemeId = useLibrary((s) => s.setThemeId);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  const btn =
    'grid h-8 w-8 place-items-center rounded-full text-muted transition hover:bg-surface-hover hover:text-fg';

  return (
    <div ref={ref} className="relative flex items-center gap-0.5">
      {settings.allowUserMode && (
        <button
          type="button"
          className={btn}
          onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
          aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
        >
          {mode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      )}
      {settings.allowUserTheme && (
        <>
          <button
            type="button"
            className={btn}
            aria-label="Choose theme"
            aria-expanded={open}
            title="Choose theme"
            onClick={() => setOpen((o) => !o)}
          >
            <Palette size={16} />
          </button>
          {open && (
            <div
              role="menu"
              className="absolute top-10 right-0 z-40 w-64 animate-fade-up rounded-2xl border border-line bg-elevated p-2 shadow-2xl shadow-black/30"
            >
              <p className="px-2 pt-1 pb-2 text-xs font-bold tracking-wider text-muted uppercase">Theme</p>
              {[{ id: null, name: 'Default (set by admin)' }, ...THEMES].map((t) => {
                const selected = (userThemeId ?? null) === t.id;
                const swatch = t.id ? THEMES.find((x) => x.id === t.id)![mode] : null;
                return (
                  <button
                    key={t.id ?? 'default'}
                    role="menuitemradio"
                    aria-checked={selected}
                    type="button"
                    onClick={() => {
                      setThemeId(t.id);
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm font-semibold transition hover:bg-surface-hover"
                  >
                    <span
                      className="h-6 w-6 shrink-0 rounded-full border border-line"
                      style={{
                        background: swatch
                          ? `conic-gradient(${swatch.bg} 0 50%, ${swatch.highlight} 0 75%, ${swatch.accent} 0)`
                          : `conic-gradient(${theme[mode].bg} 0 50%, ${theme[mode].highlight} 0)`,
                      }}
                    />
                    <span className="flex-1">{t.name}</span>
                    {selected && <Check size={16} className="text-highlight" />}
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
