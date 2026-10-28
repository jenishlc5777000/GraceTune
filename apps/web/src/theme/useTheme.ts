import { useEffect, useLayoutEffect, useSyncExternalStore } from 'react';
import { getTheme, type ThemeMode } from '@gracetunes/shared';
import { useAppearance } from '../store/appearance';
import { useLibrary } from '../store/library';
import { applyTheme } from './applyTheme';

const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
const subscribeSystem = (cb: () => void) => {
  darkQuery.addEventListener('change', cb);
  return () => darkQuery.removeEventListener('change', cb);
};

/** Resolves admin defaults + listener overrides into the theme and mode actually shown. */
export function useEffectiveTheme() {
  const settings = useAppearance((s) => s.settings);
  const userMode = useLibrary((s) => s.mode);
  const userThemeId = useLibrary((s) => s.themeId);
  const systemDark = useSyncExternalStore(subscribeSystem, () => darkQuery.matches);

  const theme = getTheme(settings.allowUserTheme && userThemeId ? userThemeId : settings.themeId);
  const adminMode: ThemeMode =
    settings.defaultMode === 'system' ? (systemDark ? 'dark' : 'light') : settings.defaultMode;
  const mode: ThemeMode = settings.allowUserMode && userMode ? userMode : adminMode;

  return { theme, mode, settings };
}

/** Mount once: applies the effective theme and keeps admin settings fresh. */
export function useThemeEngine() {
  const { theme, mode } = useEffectiveTheme();
  const refresh = useAppearance((s) => s.refresh);

  // Layout effect so the cached theme is in place before the first paint.
  useLayoutEffect(() => {
    applyTheme(theme, mode);
  }, [theme, mode]);

  useEffect(() => {
    void refresh();
    const onFocus = () => void refresh();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refresh]);
}
