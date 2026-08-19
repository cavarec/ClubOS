import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../../src/theme';

export default function ProfilScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Profil</Text>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Informations personnelles, enfants rattachés, préférences de notification.</Text>
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
