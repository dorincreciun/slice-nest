export const LOCALE = ['en', 'ro', 'ru'] as const;

export type Locale = (typeof LOCALE)[number];
