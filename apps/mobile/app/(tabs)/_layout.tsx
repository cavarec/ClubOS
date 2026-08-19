import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme';

// TODO(auth): recomposer les onglets selon le rôle (cf. docs/02-ARCHITECTURE.md
// §7 Navigation par rôle) — "Présences" visible uniquement coach/admin.
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand[600],
        tabBarInactiveTintColor: colors.slate[400],
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Accueil', tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="calendrier"
        options={{ title: 'Calendrier', tabBarIcon: ({ color, size }) => <Ionicons name="calendar" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="convocations"
        options={{ title: 'Convocations', tabBarIcon: ({ color, size }) => <Ionicons name="megaphone" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="presences"
        options={{ title: 'Présences', tabBarIcon: ({ color, size }) => <Ionicons name="checkmark-circle" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="profil"
        options={{ title: 'Profil', tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} /> }}
      />
    </Tabs>
  );
}
