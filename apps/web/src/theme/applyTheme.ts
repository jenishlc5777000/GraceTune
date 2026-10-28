import { googleFontsHref, themeCssVars, type ThemeMode, type ThemePreset } from '@gracetunes/shared';

/** Writes a preset's tokens onto <html>, loads its fonts and updates the browser chrome colour. */
export function applyTheme(theme: ThemePreset, mode: ThemeMode) {
  const root = document.documentElement;
  for (const [k, v] of Object.entries(themeCssVars(theme, mode))) root.style.setProperty(k, v);
  root.classList.toggle('dark', mode === 'dark');
  root.dataset.theme = theme.id;
  root.style.colorScheme = mode;

  let link = document.getElementById('theme-fonts') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.id = 'theme-fonts';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  const href = googleFontsHref(theme);
  if (link.href !== href) link.href = href;

  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme[mode].bg);
}
