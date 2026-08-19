import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '../../src/theme';

// Données de démonstration — à remplacer par une requête Supabase (`posts`).
const mockPosts = [
  { id: '1', title: 'Reprise des entraînements', date: '18 août' },
  { id: '2', title: 'AG 2026 - convocation', date: '10 août' },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>HBC Lesneven</Text>
      <FlatList
        data={mockPosts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDate}>{item.date}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.slate[50] },
  header: { fontSize: 20, fontWeight: '700', color: colors.ink, padding: spacing.md },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.slate[200] },
  cardTitle: { fontSize: 15, fontWeight: '600', color: colors.ink },
  cardDate: { fontSize: 12, color: colors.slate[500], marginTop: 2 },
});
