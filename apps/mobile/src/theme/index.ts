// Jetons de thème pour l'app mobile — miroir de packages/ui/src/tokens.ts.
// Dupliqué plutôt qu'importé : les composants de @clubos/ui utilisent des
// éléments DOM (div/button/img), incompatibles avec React Native sans
// react-native-web. Les valeurs de couleur doivent rester synchronisées.

export const colors = {
  ink: '#0F172A',
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
  },
  brand: {
    100: '#DBEAFE',
    500: '#2563EB',
    600: '#1D4ED8',
    700: '#1E40AF',
  },
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  white: '#FFFFFF',
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius = { sm: 6, md: 8, lg: 12, full: 999 };
