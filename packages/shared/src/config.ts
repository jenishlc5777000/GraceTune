/** Single source of truth for branding. Rename the app here; themes live in ./themes. */
export const APP_CONFIG = {
  name: 'GraceTunes',
  tagline: 'Music that lifts your soul',
  supportedLocales: ['en', 'ta', 'hi', 'ml', 'te'] as const,
  defaultLocale: 'en',
} as const;

export type Locale = (typeof APP_CONFIG.supportedLocales)[number];
