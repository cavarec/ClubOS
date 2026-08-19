import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '../../src/theme';
import type { ConvocationResponseStatus } from '@clubos/database';

interface ConvocationItem {
  id: string;
  eventTitle: string;
  eventLocation: string | null;
  startAt: string;
  meetTime?: string;
  status: ConvocationResponseStatus;
  carpoolSeatsAvailable?: number;
}

// Données de démonstration — à remplacer par une requête Supabase
// (`convocations` + `convocation_responses` filtrées par RLS).
const mockConvocations: ConvocationItem[] = [
  {
    id: '1',
    eventTitle: 'U15M vs AL Landerneau',
    eventLocation: 'Gymnase Kervao, Lesneven',
    startAt: '2026-08-23T14:00:00',
    meetTime: '13h15',
    status: 'pending',
    carpoolSeatsAvailable: 2,
  },
  {
    id: '2',
    eventTitle: 'Entraînement U15M',
    eventLocation: 'Gymnase Kervao',
    startAt: '2026-08-20T18:30:00',
    status: 'present',
  },
];

const statusLabel: Record<ConvocationResponseStatus, string> = {
  pending: 'En attente',
  present: 'Présent confirmé',
  absent: 'Absence signalée',
  maybe: 'Incertain',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ConvocationsScreen() {
  const [items, setItems] = useState(mockConvocations);

  function respond(id: string, status: 'present' | 'absent' | 'maybe') {
    setItems((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Convocations</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>{item.eventTitle}</Text>
              <Text style={styles.statusPill}>{statusLabel[item.status]}</Text>
            </View>
            <Text style={styles.cardMeta}>
              {formatDate(item.startAt)}
              {item.eventLocation ? ` · ${item.eventLocation}` : ''}
              {item.meetTime ? ` · Rdv ${item.meetTime}` : ''}
            </Text>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionButton, item.status === 'present' && styles.actionButtonPresent]}
                onPress={() => respond(item.id, 'present')}
              >
                <Text style={[styles.actionText, item.status === 'present' && styles.actionTextActive]}>Présent</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, item.status === 'absent' && styles.actionButtonAbsent]}
                onPress={() => respond(item.id, 'absent')}
              >
                <Text style={[styles.actionText, item.status === 'absent' && styles.actionTextActive]}>Absent</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, item.status === 'maybe' && styles.actionButtonMaybe]}
                onPress={() => respond(item.id, 'maybe')}
              >
                <Text style={[styles.actionText, item.status === 'maybe' && styles.actionTextActive]}>?</Text>
              </TouchableOpacity>
            </View>

            {typeof item.carpoolSeatsAvailable === 'number' && (
              <TouchableOpacity style={styles.carpoolRow}>
                <Text style={styles.carpoolText}>🚗 Covoiturage : {item.carpoolSeatsAvailable} place(s)</Text>
                <Text style={styles.carpoolCta}>Réserver →</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.slate[50] },
  header: { fontSize: 20, fontWeight: '700', color: colors.ink, padding: spacing.md, paddingBottom: 0 },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.slate[200], gap: spacing.sm },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: colors.ink, flexShrink: 1 },
  statusPill: { fontSize: 11, fontWeight: '600', color: colors.brand[700], backgroundColor: colors.brand[100], paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  cardMeta: { fontSize: 12, color: colors.slate[500] },
  actionsRow: { flexDirection: 'row', gap: spacing.sm },
  actionButton: { borderWidth: 1, borderColor: colors.slate[200], borderRadius: radius.md, paddingVertical: 6, paddingHorizontal: 12 },
  actionButtonPresent: { backgroundColor: colors.success, borderColor: colors.success },
  actionButtonAbsent: { backgroundColor: colors.danger, borderColor: colors.danger },
  actionButtonMaybe: { backgroundColor: colors.warning, borderColor: colors.warning },
  actionText: { fontSize: 12, fontWeight: '600', color: colors.slate[600] },
  actionTextActive: { color: colors.white },
  carpoolRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.slate[50], padding: spacing.sm, borderRadius: radius.md },
  carpoolText: { fontSize: 12, color: colors.slate[600] },
  carpoolCta: { fontSize: 12, color: colors.brand[600], fontWeight: '600' },
});
