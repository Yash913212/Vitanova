import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../utils/theme';

export default function EmptyState({ icon = '📭', title, message }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.huge },
  icon: { fontSize: 56, marginBottom: SPACING.md },
  title: { fontSize: TYPOGRAPHY.h4, fontWeight: TYPOGRAPHY.semiBold, color: COLORS.textSecondary },
  message: { fontSize: TYPOGRAPHY.bodySmall, color: COLORS.textTertiary, textAlign: 'center', marginTop: SPACING.xs, maxWidth: 260 },
});
