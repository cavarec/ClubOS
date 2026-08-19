import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../../src/theme';

// Visible uniquement pour coach/director/club_admin en production
// (cf. docs/05-API-PERMISSIONS.md §19 — filtrage à faire dans (tabs)/_layout.tsx
// une fois le rôle de l'utilisateur connu côté client).
export default function PresencesScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Présences</Text>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Pointage des présences par équipe — à connecter à `presences`.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.slate[50] },
  header: { fontSize: 20, fontWeight: '700', color: colors.ink, padding: spacing.md },
  placeholder: { padding: spacing.md },
  placeholderText: { color: colors.slate[500], fontSize: 13 },
});
