import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { TYPOGRAPHY, SPACING, RADIUS } from '../utils/theme';
import { useAppTheme } from '../hooks/useAppTheme';

export default function SettingRow({ label, description, value, onValueChange, type = 'switch' }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.row, { backgroundColor: colors.surface }]}>
      <View style={styles.textWrap}>
        <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>
        {description && <Text style={[styles.desc, { color: colors.textTertiary }]}>{description}</Text>}
      </View>
      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.borderLight, true: colors.primaryLight }}
          thumbColor={value ? colors.primary : colors.borderLight}
        />
      )}
      {type === 'value' && (
        <Text style={[styles.valueText, { color: colors.accent }]}>{value}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  textWrap: { flex: 1, marginRight: SPACING.md },
  label: { fontSize: TYPOGRAPHY.body, fontWeight: TYPOGRAPHY.medium },
  desc: { fontSize: TYPOGRAPHY.caption, marginTop: 2 },
  valueText: { fontSize: TYPOGRAPHY.bodySmall, fontWeight: TYPOGRAPHY.semiBold },
});
