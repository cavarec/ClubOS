// ClubOS — design tokens.
// Palette neutre + une couleur d'accent par tenant (surchargée via
// `tenants.settings.brandColor` pour le site public et le thème du club).

export const colors = {
  // Neutrals
  ink: '#0F172A',
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  // Accent par défaut (marque ClubOS) — surchargeable par tenant
  brand: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    300: '#93C5FD',
    500: '#2563EB',
    600: '#1D4ED8',
    700: '#1E40AF',
  },
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
} as const;

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
} as const;

export const radius = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  full: '9999px',
} as const;

export const typography = {
  fontSans: '"Inter", ui-sans-serif, system-ui, sans-serif',
  scale: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
  },
} as const;

// Rôle -> couleur (badges de rôle utilisés dans les listes de membres)
export const roleColors: Record<string, string> = {
  player: colors.brand[500],
  parent: colors.slate[500],
  coach: colors.success,
  director: colors.warning,
  club_admin: colors.danger,
  committee_admin: colors.brand[700],
  league_admin: colors.brand[700],
  federation_admin: colors.brand[700],
};
