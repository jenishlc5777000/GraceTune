import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ThemeMode } from '@gracetunes/shared';

interface LibraryState {
  likedTracks: string[];
  savedAlbums: string[];
  savedPlaylists: string[];
  followedArtists: string[];
  recent: string[];
  /** Listener overrides; null = follow the admin default. Only honoured when the admin allows it. */
  mode: ThemeMode | null;
  themeId: string | null;
  toggleLike: (slug: string) => void;
  toggleAlbum: (slug: string) => void;
  togglePlaylist: (slug: string) => void;
  toggleFollow: (slug: string) => void;
  pushRecent: (key: string) => void;
  setMode: (mode: ThemeMode | null) => void;
  setThemeId: (id: string | null) => void;
}

const toggleIn = (list: string[], v: string) =>
  list.includes(v) ? list.filter((x) => x !== v) : [v, ...list];

/** Local-only library until the library API lands (Phase 3). */
export const useLibrary = create<LibraryState>()(
  persist(
    (set) => ({
      likedTracks: ['morning-mercies', 'anchor-hymn', 'kaalai-thuthi'],
      savedAlbums: ['morning-mercies'],
      savedPlaylists: ['sunrise-worship'],
      followedArtists: ['selah-rivers'],
      recent: ['playlist:sunrise-worship', 'album:hymns-at-dusk', 'artist:kirubai-collective'],
      mode: null,
      themeId: null,
      toggleLike: (slug) => set((s) => ({ likedTracks: toggleIn(s.likedTracks, slug) })),
      toggleAlbum: (slug) => set((s) => ({ savedAlbums: toggleIn(s.savedAlbums, slug) })),
      togglePlaylist: (slug) => set((s) => ({ savedPlaylists: toggleIn(s.savedPlaylists, slug) })),
      toggleFollow: (slug) => set((s) => ({ followedArtists: toggleIn(s.followedArtists, slug) })),
      pushRecent: (key) =>
        set((s) => ({ recent: [key, ...s.recent.filter((k) => k !== key)].slice(0, 8) })),
      setMode: (mode) => set({ mode }),
      setThemeId: (themeId) => set({ themeId }),
    }),
    {
      name: 'gracetunes-library',
      version: 1,
      // v0 stored a forced `theme: 'dark' | 'light'`; drop it so admin defaults apply.
      migrate: (persisted) => {
        const { theme: _theme, ...rest } = persisted as Record<string, unknown>;
        return { ...rest, mode: null, themeId: null } as unknown as LibraryState;
      },
      storage: createJSONStorage(() => {
        try {
          return localStorage;
        } catch {
          return sessionStorage;
        }
      }),
    },
  ),
);
