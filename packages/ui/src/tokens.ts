// ClubOS — design tokens.
// Palette neutre + une couleur d'accent par tenant (surchargée via
// `tenants.settings.brandColor` pour le site public et le thème du club).

export const colors = {
  // Neutrals
  ink: '#0F172A',
  // Navy de marque — couleur du wordmark "Club" et de l'anneau extérieur du
  // logo (cf. asset logo fourni). Plus profond que `ink`, réservé à
  // l'identité de marque (logo, en-têtes marketing) plutôt qu'au texte
  // courant de l'UI.
  navy: '#0B1E39',
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
    400: '#38BDF8',
    500: '#2563EB',
    600: '#1D4ED8',
    700: '#1E40AF',
  },
  // Accent secondaire (cyan) — cf. design system, utilisé en complément du bleu de marque
  secondary: '#06B6D4',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
} as const;

// Dégradé de la partie "OS" du wordmark et de l'icône power du logo —
// cyan clair vers bleu profond.
export const brandGradient = {
  from: colors.brand[400],
  to: colors.brand[600],
  css: `linear-gradient(135deg, ${colors.brand[400]} 0%, ${colors.brand[600]} 100%)`,
} as const;

// Palette par sport — inspirée de l'anneau d'icônes multicolores du logo.
// Utilisée pour coder visuellement les badges d'équipe/catégorie par sport
// dans les listes multi-sport (comité/ligue).
export const sportColors: Record<string, string> = {
  handball: '#1E3A8A',
  football: '#16A34A',
  basketball: '#F97316',
  rugby: '#DC2626',
  volleyball: '#F59E0B',
  tennis: '#65A30D',
  judo: '#7C3AED',
  natation: '#0891B2',
  athletisme: '#DB2777',
  omnisports: '#6B7280',
};

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
} as const;

export const radius = {
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  full: '9999px',
} as const;

export const shadow = {
  sm: '0 2px 8px rgba(15, 23, 42, 0.05)',
  md: '0 8px 24px rgba(15, 23, 42, 0.08)',
  lg: '0 18px 40px rgba(15, 23, 42, 0.12)',
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
