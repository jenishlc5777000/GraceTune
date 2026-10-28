import { create } from 'zustand';
import { appearanceSchema, DEFAULT_APPEARANCE, type AppearanceSettings } from '@gracetunes/shared';
import { API_URL } from '../lib/api';

const CACHE_KEY = 'gracetunes-appearance';

function readCache(): AppearanceSettings {
  try {
    const parsed = appearanceSchema.safeParse(JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null'));
    return parsed.success ? parsed.data : DEFAULT_APPEARANCE;
  } catch {
    return DEFAULT_APPEARANCE;
  }
}

interface AppearanceState {
  settings: AppearanceSettings;
  refresh: () => Promise<void>;
}

/**
 * Admin-controlled appearance. Cached locally so the right theme paints
 * instantly; refreshed from the API on load and whenever the tab regains focus.
 */
export const useAppearance = create<AppearanceState>((set) => ({
  settings: readCache(),
  refresh: async () => {
    try {
      const res = await fetch(`${API_URL}/settings/appearance`);
      if (!res.ok) return;
      const parsed = appearanceSchema.safeParse(await res.json());
      if (!parsed.success) return;
      set({ settings: parsed.data });
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(parsed.data));
      } catch {
        // Storage unavailable (private mode); the theme still applies for this session.
      }
    } catch {
      // API offline: keep the cached or default theme.
    }
  },
}));
