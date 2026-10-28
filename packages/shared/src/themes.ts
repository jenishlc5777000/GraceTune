import { z } from 'zod';

export interface ThemePalette {
  bg: string;
  elevated: string;
  surface: string;
  surfaceHover: string;
  line: string;
  fg: string;
  muted: string;
  accent: string;
  accentStrong: string;
  /** Used for active states, play buttons and links. */
  highlight: string;
  /** Second stop of highlight gradients. */
  highlightStrong: string;
  /** Text drawn on top of the highlight colour. */
  onHighlight: string;
  /** Hero cards (verse of the day) stay dark in both modes. */
  heroFrom: string;
  heroTo: string;
  glowA: string;
  glowB: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  fonts: {
    sans: string;
    heading: string;
    /** Serif/expressive face for verses and editorial titles. */
    display: string;
    /** Google Fonts css2 `family=` query. */
    googleQuery: string;
  };
  /** Multiplies Tailwind's radius scale (1 = default). */
  radiusScale: number;
  /** Frosted translucent bars vs. solid surfaces. */
  glass: boolean;
  /** CSS filter applied to generated cover art. */
  coverFilter: string;
  dark: ThemePalette;
  light: ThemePalette;
}

export const THEMES = [
  {
    id: 'midnight-grace',
    name: 'Midnight Grace',
    description: 'Deep navy with warm gold. Modern, calm and glassy.',
    fonts: {
      sans: "'Plus Jakarta Sans'",
      heading: "'Plus Jakarta Sans'",
      display: "'Fraunces'",
      googleQuery:
        'family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800',
    },
    radiusScale: 1,
    glass: true,
    coverFilter: 'none',
    dark: {
      bg: '#070b18', elevated: '#0d1326', surface: 'rgb(255 255 255 / 0.045)',
      surfaceHover: 'rgb(255 255 255 / 0.09)', line: 'rgb(255 255 255 / 0.08)',
      fg: '#eef1fb', muted: '#8d97b5', accent: '#3d5afe', accentStrong: '#1a237e',
      highlight: '#e9b949', highlightStrong: '#f59e0b', onHighlight: '#0b1020',
      heroFrom: '#1b2559', heroTo: '#0b1020',
      glowA: 'rgb(61 90 254 / 0.22)', glowB: 'rgb(233 185 73 / 0.08)',
    },
    light: {
      bg: '#f5f6fb', elevated: '#ffffff', surface: 'rgb(15 23 42 / 0.04)',
      surfaceHover: 'rgb(15 23 42 / 0.08)', line: 'rgb(15 23 42 / 0.09)',
      fg: '#0d1326', muted: '#5b6480', accent: '#3d5afe', accentStrong: '#1a237e',
      highlight: '#a86f00', highlightStrong: '#e9b949', onHighlight: '#0b1020',
      heroFrom: '#1b2559', heroTo: '#0d1326',
      glowA: 'rgb(61 90 254 / 0.16)', glowB: 'rgb(233 185 73 / 0.14)',
    },
  },
  {
    id: 'sanctuary',
    name: 'Sanctuary',
    description: 'Parchment, burgundy and antique gold, with serif headings like an old hymnal.',
    fonts: {
      sans: "'Source Sans 3'",
      heading: "'Cormorant Garamond'",
      display: "'Cormorant Garamond'",
      googleQuery:
        'family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Source+Sans+3:wght@400;500;600;700;800',
    },
    radiusScale: 0.4,
    glass: false,
    coverFilter: 'sepia(0.28) saturate(0.85) contrast(1.05)',
    dark: {
      bg: '#16100b', elevated: '#201811', surface: 'rgb(255 240 220 / 0.05)',
      surfaceHover: 'rgb(255 240 220 / 0.09)', line: 'rgb(255 240 220 / 0.1)',
      fg: '#f3e9d8', muted: '#b09a82', accent: '#c9a24a', accentStrong: '#6b4b14',
      highlight: '#d9b45a', highlightStrong: '#b8862b', onHighlight: '#1a0f08',
      heroFrom: '#4a1520', heroTo: '#1a0c08',
      glowA: 'rgb(123 30 43 / 0.25)', glowB: 'rgb(201 162 74 / 0.08)',
    },
    light: {
      bg: '#f6f0e4', elevated: '#fffaf0', surface: 'rgb(74 44 20 / 0.05)',
      surfaceHover: 'rgb(74 44 20 / 0.1)', line: 'rgb(74 44 20 / 0.14)',
      fg: '#2b1a10', muted: '#7a6250', accent: '#8a5a14', accentStrong: '#4a2f08',
      highlight: '#7b1e2b', highlightStrong: '#a33a45', onHighlight: '#fffaf0',
      heroFrom: '#4a1520', heroTo: '#22090e',
      glowA: 'rgb(123 30 43 / 0.1)', glowB: 'rgb(201 162 74 / 0.16)',
    },
  },
  {
    id: 'sunrise',
    name: 'Sunrise Praise',
    description: 'Violet and coral with big rounded shapes. Bright and joyful.',
    fonts: {
      sans: "'Outfit'",
      heading: "'Outfit'",
      display: "'Playfair Display'",
      googleQuery:
        'family=Outfit:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;1,500',
    },
    radiusScale: 1.6,
    glass: true,
    coverFilter: 'saturate(1.25)',
    dark: {
      bg: '#120a1f', elevated: '#1c1130', surface: 'rgb(255 255 255 / 0.06)',
      surfaceHover: 'rgb(255 255 255 / 0.11)', line: 'rgb(255 255 255 / 0.1)',
      fg: '#fff4ef', muted: '#b9a6c9', accent: '#8b5cf6', accentStrong: '#4c1d95',
      highlight: '#ff7a59', highlightStrong: '#ffb347', onHighlight: '#1a0b12',
      heroFrom: '#6d28d9', heroTo: '#be185d',
      glowA: 'rgb(139 92 246 / 0.3)', glowB: 'rgb(255 122 89 / 0.18)',
    },
    light: {
      bg: '#fff7f2', elevated: '#ffffff', surface: 'rgb(76 29 149 / 0.05)',
      surfaceHover: 'rgb(76 29 149 / 0.1)', line: 'rgb(76 29 149 / 0.12)',
      fg: '#2a1240', muted: '#7a6390', accent: '#7c3aed', accentStrong: '#4c1d95',
      highlight: '#d03d1f', highlightStrong: '#ff8a4c', onHighlight: '#ffffff',
      heroFrom: '#7c3aed', heroTo: '#db2777',
      glowA: 'rgb(124 58 237 / 0.14)', glowB: 'rgb(255 122 89 / 0.16)',
    },
  },
  {
    id: 'olive-grove',
    name: 'Olive Grove',
    description: 'Sage and stone. Quiet and minimal, with solid surfaces.',
    fonts: {
      sans: "'DM Sans'",
      heading: "'DM Sans'",
      display: "'DM Serif Display'",
      googleQuery: 'family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1',
    },
    radiusScale: 0.8,
    glass: false,
    coverFilter: 'saturate(0.75)',
    dark: {
      bg: '#0e130c', elevated: '#151c12', surface: 'rgb(230 240 220 / 0.045)',
      surfaceHover: 'rgb(230 240 220 / 0.085)', line: 'rgb(230 240 220 / 0.09)',
      fg: '#e9eee2', muted: '#9aa78f', accent: '#8fb36f', accentStrong: '#3c5230',
      highlight: '#b5d38f', highlightStrong: '#8fb36f', onHighlight: '#0e130c',
      heroFrom: '#2f4426', heroTo: '#0e130c',
      glowA: 'rgb(143 179 111 / 0.12)', glowB: 'rgb(181 211 143 / 0.06)',
    },
    light: {
      bg: '#f3f4ee', elevated: '#fbfcf8', surface: 'rgb(40 52 30 / 0.045)',
      surfaceHover: 'rgb(40 52 30 / 0.09)', line: 'rgb(40 52 30 / 0.12)',
      fg: '#1e261a', muted: '#63705a', accent: '#4d6b3c', accentStrong: '#2a3d20',
      highlight: '#5f7f45', highlightStrong: '#8aa66b', onHighlight: '#ffffff',
      heroFrom: '#2f4426', heroTo: '#18230f',
      glowA: 'rgb(77 107 60 / 0.12)', glowB: 'rgb(138 166 107 / 0.12)',
    },
  },
] as const satisfies readonly ThemePreset[];

export type ThemeId = (typeof THEMES)[number]['id'];
export type ThemeMode = 'dark' | 'light';

export const DEFAULT_THEME_ID: ThemeId = 'midnight-grace';

export function getTheme(id: string | null | undefined): ThemePreset {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

const themeIds = THEMES.map((t) => t.id) as [ThemeId, ...ThemeId[]];

/** AppSetting key holding the admin-controlled appearance. */
export const APPEARANCE_KEY = 'appearance';

/** Admin-controlled appearance, stored in AppSetting under APPEARANCE_KEY. */
export const appearanceSchema = z.object({
  themeId: z.enum(themeIds),
  defaultMode: z.enum(['dark', 'light', 'system']),
  allowUserMode: z.boolean(),
  allowUserTheme: z.boolean(),
});

export type AppearanceSettings = z.infer<typeof appearanceSchema>;

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  themeId: DEFAULT_THEME_ID,
  defaultMode: 'dark',
  allowUserMode: true,
  allowUserTheme: false,
};

const BASE_RADIUS = { xs: 0.125, sm: 0.25, md: 0.375, lg: 0.5, xl: 0.75, '2xl': 1, '3xl': 1.5 };

/** CSS custom properties for a preset/mode; apps assign them to :root. */
export function themeCssVars(theme: ThemePreset, mode: ThemeMode): Record<string, string> {
  const p = theme[mode];
  const vars: Record<string, string> = {
    '--bg': p.bg,
    '--bg-elevated': p.elevated,
    '--surface': p.surface,
    '--surface-hover': p.surfaceHover,
    '--line': p.line,
    '--fg': p.fg,
    '--muted': p.muted,
    '--accent': p.accent,
    '--accent-strong': p.accentStrong,
    '--highlight': p.highlight,
    '--highlight-strong': p.highlightStrong,
    '--on-highlight': p.onHighlight,
    '--hero-from': p.heroFrom,
    '--hero-to': p.heroTo,
    '--glow-a': p.glowA,
    '--glow-b': p.glowB,
    '--app-font-sans': `${theme.fonts.sans}, ui-sans-serif, system-ui, sans-serif`,
    '--app-font-heading': `${theme.fonts.heading}, ui-sans-serif, system-ui, sans-serif`,
    '--app-font-display': `${theme.fonts.display}, ui-serif, Georgia, serif`,
    '--glass-mix': theme.glass ? '72%' : '100%',
    '--glass-blur': theme.glass ? '24px' : '0px',
    '--cover-filter': theme.coverFilter,
  };
  for (const [k, rem] of Object.entries(BASE_RADIUS)) {
    vars[`--radius-${k}`] = `${rem * theme.radiusScale}rem`;
  }
  return vars;
}

export const googleFontsHref = (theme: ThemePreset) =>
  `https://fonts.googleapis.com/css2?${theme.fonts.googleQuery}&display=swap`;
