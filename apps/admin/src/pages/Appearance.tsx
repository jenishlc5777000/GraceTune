import { Check, Loader2, Monitor, Moon, RotateCcw, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  DEFAULT_APPEARANCE,
  getTheme,
  THEMES,
  type AppearanceSettings,
  type ThemeMode,
} from '@gracetunes/shared';
import { ThemePreview } from '../components/ThemePreview';
import { api, ApiError } from '../lib/api';
import { useSession } from '../store/session';

type Status = { kind: 'idle' } | { kind: 'saved' } | { kind: 'error'; message: string };

const MODES = [
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'system', label: 'Match device', icon: Monitor },
] as const;

function Toggle({ checked, onChange, label, hint, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint: string; disabled?: boolean }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-6 py-3">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-sm text-slate-500 dark:text-slate-400">{hint}</span>
      </span>
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input type="checkbox" role="switch" className="peer sr-only" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
        <span className="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-indigo-600 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 peer-disabled:opacity-50 dark:bg-white/15" />
        <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

const card = 'rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]';

export function Appearance() {
  const isAdmin = useSession((s) => s.user?.role === 'ADMIN');
  const [saved, setSaved] = useState<AppearanceSettings | null>(null);
  const [draft, setDraft] = useState<AppearanceSettings>(DEFAULT_APPEARANCE);
  const [previewMode, setPreviewMode] = useState<ThemeMode>('dark');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  useEffect(() => {
    api<AppearanceSettings>('/settings/appearance')
      .then((s) => {
        setSaved(s);
        setDraft(s);
        if (s.defaultMode !== 'system') setPreviewMode(s.defaultMode);
      })
      .catch((e) => setLoadError(e instanceof ApiError ? e.message : 'Could not load settings'));
  }, []);

  const dirty = saved !== null && JSON.stringify(saved) !== JSON.stringify(draft);
  const update = (patch: Partial<AppearanceSettings>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setStatus({ kind: 'idle' });
  };

  const save = async () => {
    setSaving(true);
    try {
      const next = await api<AppearanceSettings>('/settings/appearance', { method: 'PUT', body: JSON.stringify(draft) });
      setSaved(next);
      setDraft(next);
      setStatus({ kind: 'saved' });
    } catch (e) {
      setStatus({ kind: 'error', message: e instanceof ApiError ? e.message : 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  if (loadError) {
    return (
      <div className="p-6 md:p-10">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">{loadError}</div>
      </div>
    );
  }

  if (!saved) {
    return (
      <div className="grid h-64 place-items-center text-slate-500">
        <Loader2 className="animate-spin" aria-label="Loading" />
      </div>
    );
  }

  const theme = getTheme(draft.themeId);

  return (
    <div className="mx-auto max-w-7xl p-4 pb-28 md:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Appearance</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Pick the look of the listener app. Changes apply to everyone the next time they open or refocus the app.
        </p>
        {!isAdmin && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
            Moderators can view these settings. Only admins can change them.
          </p>
        )}
      </header>

      <div className="grid gap-6 xl:grid-cols-[1fr_minmax(0,520px)]">
        <div className="space-y-6">
          <section className={card} aria-labelledby="theme-heading">
            <h2 id="theme-heading" className="font-semibold">Theme</h2>
            <div role="radiogroup" aria-labelledby="theme-heading" className="mt-4 grid gap-3 sm:grid-cols-2">
              {THEMES.map((t) => {
                const selected = draft.themeId === t.id;
                const p = t[previewMode];
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={!isAdmin}
                    onClick={() => update({ themeId: t.id })}
                    className={`relative rounded-xl border p-4 text-left transition disabled:cursor-not-allowed ${
                      selected
                        ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                        : 'border-slate-200 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/25'
                    }`}
                  >
                    {selected && (
                      <span className="absolute top-3 right-3 grid h-5 w-5 place-items-center rounded-full bg-indigo-600 text-white">
                        <Check size={13} />
                      </span>
                    )}
                    <div className="flex h-14 overflow-hidden rounded-lg border border-black/5" aria-hidden>
                      <span className="flex-[3]" style={{ background: p.bg }} />
                      <span className="flex-1" style={{ background: p.elevated }} />
                      <span className="flex-1" style={{ background: p.accent }} />
                      <span className="flex-1" style={{ background: p.highlight }} />
                      <span className="flex-1" style={{ background: `linear-gradient(135deg, ${p.heroFrom}, ${p.heroTo})` }} />
                    </div>
                    <p className="mt-3 text-[17px] font-semibold" style={{ fontFamily: t.fonts.heading }}>
                      {t.name}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{t.description}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 dark:bg-white/10">{t.fonts.sans.replaceAll("'", '')}</span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 dark:bg-white/10">{t.glass ? 'Glass' : 'Solid'}</span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 dark:bg-white/10">
                        {t.radiusScale < 0.7 ? 'Sharp corners' : t.radiusScale > 1.2 ? 'Extra round' : 'Rounded'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className={card} aria-labelledby="mode-heading">
            <h2 id="mode-heading" className="font-semibold">Default mode</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">What new listeners see before they choose for themselves.</p>
            <div role="radiogroup" aria-labelledby="mode-heading" className="mt-4 inline-flex rounded-xl bg-slate-100 p-1 dark:bg-white/5">
              {MODES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={draft.defaultMode === id}
                  disabled={!isAdmin}
                  onClick={() => {
                    update({ defaultMode: id });
                    if (id !== 'system') setPreviewMode(id);
                  }}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                    draft.defaultMode === id ? 'bg-white shadow-sm dark:bg-white/15' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <Icon size={15} /> {label}
                </button>
              ))}
            </div>
          </section>

          <section className={card} aria-labelledby="listener-heading">
            <h2 id="listener-heading" className="font-semibold">Listener choices</h2>
            <div className="mt-1 divide-y divide-slate-200 dark:divide-white/10">
              <Toggle
                label="Let listeners switch light / dark"
                hint="Shows a sun/moon button in the listener app."
                checked={draft.allowUserMode}
                disabled={!isAdmin}
                onChange={(v) => update({ allowUserMode: v })}
              />
              <Toggle
                label="Let listeners pick their own theme"
                hint="Shows a palette menu with every theme. Your theme stays the default."
                checked={draft.allowUserTheme}
                disabled={!isAdmin}
                onChange={(v) => update({ allowUserTheme: v })}
              />
            </div>
          </section>
        </div>

        <aside className="xl:sticky xl:top-8 xl:self-start">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Live preview</h2>
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium dark:bg-white/5">
              {(['dark', 'light'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={previewMode === m}
                  onClick={() => setPreviewMode(m)}
                  className={`rounded-md px-2.5 py-1 capitalize ${previewMode === m ? 'bg-white shadow-sm dark:bg-white/15' : 'text-slate-500'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <ThemePreview theme={theme} mode={previewMode} />
        </aside>
      </div>

      {isAdmin && (dirty || status.kind !== 'idle') && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/90 backdrop-blur md:left-60 dark:border-white/10 dark:bg-[#0b0d12]/90">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
            <p className="text-sm" role="status">
              {status.kind === 'saved' ? (
                <span className="font-medium text-emerald-600 dark:text-emerald-400">Saved. The listener app will update shortly.</span>
              ) : status.kind === 'error' ? (
                <span className="font-medium text-red-600 dark:text-red-400">{status.message}</span>
              ) : (
                <span className="text-slate-600 dark:text-slate-300">You have unsaved changes.</span>
              )}
            </p>
            <div className="flex gap-2">
              {dirty && (
                <button
                  type="button"
                  onClick={() => update(saved)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
                >
                  <RotateCcw size={15} /> Discard
                </button>
              )}
              <button
                type="button"
                onClick={save}
                disabled={!dirty || saving}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
              >
                {saving && <Loader2 size={15} className="animate-spin" />} Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
