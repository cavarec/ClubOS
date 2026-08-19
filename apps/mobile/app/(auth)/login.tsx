import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../src/theme';
import { supabase } from '../../src/lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function handleMagicLink() {
    setStatus('sending');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: 'clubos://auth/callback' },
    });
    setStatus(error ? 'error' : 'sent');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ClubOS</Text>
      <Text style={styles.subtitle}>Recevez un lien de connexion par email, sans mot de passe.</Text>

      <TextInput
        style={styles.input}
        placeholder="prenom.nom@club.fr"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity style={styles.button} onPress={handleMagicLink} disabled={status === 'sending'}>
        <Text style={styles.buttonText}>
          {status === 'sending' ? 'Envoi en cours…' : 'Recevoir le lien de connexion'}
        </Text>
      </TouchableOpacity>

      {status === 'sent' && <Text style={styles.success}>Lien envoyé — vérifiez votre boîte mail.</Text>}
      {status === 'error' && <Text style={styles.error}>Une erreur est survenue, réessayez.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.white },
  title: { fontSize: 28, fontWeight: '700', color: colors.ink, marginBottom: spacing.xs },
  subtitle: { fontSize: 14, color: colors.slate[500], marginBottom: spacing.lg },
  input: {
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 14,
    marginBottom: spacing.md,
  },
  button: { backgroundColor: colors.brand[600], borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  buttonText: { color: colors.white, fontWeight: '600', fontSize: 14 },
  success: { color: colors.success, marginTop: spacing.md, fontSize: 13 },
  error: { color: colors.danger, marginTop: spacing.md, fontSize: 13 },
});
