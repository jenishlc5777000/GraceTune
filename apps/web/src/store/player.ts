import { create } from 'zustand';
import type { CatalogTrack } from '@gracetunes/shared';
import { artistName } from '../lib/catalog';

export type RepeatMode = 'off' | 'all' | 'one';

interface PlayerState {
  queue: CatalogTrack[];
  /** Order of queue indices to play; differs from 0..n when shuffled. */
  order: number[];
  cursor: number;
  isPlaying: boolean;
  position: number;
  duration: number;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  rate: number;
  sleepAt: number | null;
  panel: 'none' | 'lyrics' | 'queue';

  current: () => CatalogTrack | undefined;
  playList: (list: CatalogTrack[], startIndex?: number) => void;
  toggle: () => void;
  next: (auto?: boolean) => void;
  prev: () => void;
  seek: (sec: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setRate: (r: number) => void;
  setSleepTimer: (minutes: number | null) => void;
  setPanel: (p: PlayerState['panel']) => void;
  addToQueue: (t: CatalogTrack) => void;
}

const audio = new Audio();
audio.preload = 'auto';

export const sameList = (a: CatalogTrack[], b: CatalogTrack[]) =>
  a.length === b.length && a.every((t, i) => t.slug === b[i]?.slug);

function shuffled(n: number, first: number) {
  const rest = [...Array(n).keys()].filter((i) => i !== first);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j]!, rest[i]!];
  }
  return [first, ...rest];
}

export const usePlayer = create<PlayerState>((set, get) => {
  const load = (cursor: number, autoplay = true) => {
    const { queue, order } = get();
    const track = queue[order[cursor] ?? -1];
    if (!track) return;
    set({ cursor, position: 0, duration: track.durationSec });
    audio.src = track.audioUrl;
    audio.playbackRate = get().rate;
    if (autoplay) void audio.play().catch(() => set({ isPlaying: false }));
    updateMediaSession(track);
  };

  return {
    queue: [],
    order: [],
    cursor: 0,
    isPlaying: false,
    position: 0,
    duration: 0,
    volume: 0.8,
    muted: false,
    shuffle: false,
    repeat: 'off',
    rate: 1,
    sleepAt: null,
    panel: 'none',

    current: () => {
      const { queue, order, cursor } = get();
      return queue[order[cursor] ?? -1];
    },

    playList: (list, startIndex = 0) => {
      const current = get().current();
      if (current && list[startIndex]?.slug === current.slug && sameList(get().queue, list)) {
        get().toggle();
        return;
      }
      const order = get().shuffle ? shuffled(list.length, startIndex) : [...list.keys()];
      set({ queue: list, order });
      load(get().shuffle ? 0 : startIndex);
    },

    toggle: () => {
      if (!audio.src) {
        if (get().queue.length) load(get().cursor);
        return;
      }
      if (audio.paused) void audio.play();
      else audio.pause();
    },

    next: (auto = false) => {
      const { cursor, order, repeat } = get();
      if (auto && repeat === 'one') {
        audio.currentTime = 0;
        void audio.play();
        return;
      }
      if (cursor + 1 < order.length) load(cursor + 1);
      else if (repeat === 'all') load(0);
      else if (auto) set({ isPlaying: false });
    },

    prev: () => {
      if (audio.currentTime > 3) {
        audio.currentTime = 0;
        return;
      }
      load(Math.max(0, get().cursor - 1));
    },

    seek: (sec) => {
      audio.currentTime = sec;
      set({ position: sec });
    },

    setVolume: (volume) => {
      audio.volume = volume;
      audio.muted = false;
      set({ volume, muted: false });
    },

    toggleMute: () => {
      audio.muted = !get().muted;
      set({ muted: audio.muted });
    },

    toggleShuffle: () => {
      const { shuffle, queue, order, cursor } = get();
      const playing = order[cursor] ?? 0;
      if (shuffle) set({ shuffle: false, order: [...queue.keys()], cursor: playing });
      else set({ shuffle: true, order: shuffled(queue.length, playing), cursor: 0 });
    },

    cycleRepeat: () =>
      set(({ repeat }) => ({ repeat: repeat === 'off' ? 'all' : repeat === 'all' ? 'one' : 'off' })),

    setRate: (rate) => {
      audio.playbackRate = rate;
      set({ rate });
    },

    setSleepTimer: (minutes) => set({ sleepAt: minutes ? Date.now() + minutes * 60_000 : null }),

    setPanel: (p) => set(({ panel }) => ({ panel: panel === p ? 'none' : p })),

    addToQueue: (t) => {
      const { queue, order } = get();
      if (!queue.length) {
        get().playList([t]);
        return;
      }
      set({ queue: [...queue, t], order: [...order, queue.length] });
    },
  };
});

audio.volume = usePlayer.getState().volume;
audio.addEventListener('play', () => usePlayer.setState({ isPlaying: true }));
audio.addEventListener('pause', () => usePlayer.setState({ isPlaying: false }));
audio.addEventListener('loadedmetadata', () => usePlayer.setState({ duration: audio.duration }));
audio.addEventListener('timeupdate', () => {
  usePlayer.setState({ position: audio.currentTime });
  const { sleepAt } = usePlayer.getState();
  if (sleepAt && Date.now() >= sleepAt) {
    audio.pause();
    usePlayer.setState({ sleepAt: null });
  }
});
audio.addEventListener('ended', () => usePlayer.getState().next(true));

/** Lock-screen / hardware media key support. */
function updateMediaSession(track: CatalogTrack) {
  if (!('mediaSession' in navigator)) return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.title,
    artist: artistName(track),
    album: 'GraceTunes',
  });
  const s = usePlayer.getState;
  navigator.mediaSession.setActionHandler('play', () => s().toggle());
  navigator.mediaSession.setActionHandler('pause', () => s().toggle());
  navigator.mediaSession.setActionHandler('nexttrack', () => s().next());
  navigator.mediaSession.setActionHandler('previoustrack', () => s().prev());
}
