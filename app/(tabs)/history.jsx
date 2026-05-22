/**
 * NutriVision AI — History Screen
 */
import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useHistory } from '../../src/providers/HistoryProvider';
import HistoryCard from '../../src/components/HistoryCard';
import EmptyState from '../../src/components/EmptyState';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../src/utils/theme';
import { TouchableOpacity } from 'react-native';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import TabTransitionWrapper from '../../src/components/TabTransitionWrapper';

export default function HistoryScreen() {
  const { colors } = useAppTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const { history, deleteEntry, clearHistory, searchHistory } = useHistory();
  const router = useRouter();

  const filteredHistory = searchQuery ? searchHistory(searchQuery) : history;

  const handlePress = useCallback((entry) => {
    router.push({
      pathname: '/nutrition-details',
      params: {
        data: JSON.stringify(entry),
      },
    });
  }, [router]);

  const handleDelete = useCallback((id) => {
    Alert.alert('Delete Entry', 'Remove this scan from history?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteEntry(id) },
    ]);
  }, [deleteEntry]);

  const handleClearAll = useCallback(() => {
    Alert.alert('Clear History', 'Are you sure you want to clear all scan history?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear All', style: 'destructive', onPress: clearHistory },
    ]);
  }, [clearHistory]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TabTransitionWrapper>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>📋 Scan History</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{history.length} scans recorded</Text>
        </View>
        {history.length > 0 && (
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={styles.clearBtn}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search */}
      {history.length > 0 && (
        <View style={styles.searchWrap}>
          <TextInput
            style={[styles.searchInput, { backgroundColor: colors.surface, color: colors.textPrimary }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="🔍 Search history..."
            placeholderTextColor={colors.textTertiary}
          />
        </View>
      )}

      {/* List */}
      <FlatList
        data={filteredHistory}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HistoryCard
            entry={item}
            onPress={() => handlePress(item)}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="📷"
            title="No scans yet"
            message="Scan food items to see your history here"
          />
        }
      />
    </TabTransitionWrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: SPACING.lg, backgroundColor: COLORS.surface, ...SHADOWS.sm,
  },
  title: { fontSize: TYPOGRAPHY.h3, fontWeight: TYPOGRAPHY.bold, color: COLORS.textPrimary },
  subtitle: { fontSize: TYPOGRAPHY.caption, color: COLORS.textTertiary, marginTop: 2 },
  clearBtn: { fontSize: TYPOGRAPHY.bodySmall, color: COLORS.error, fontWeight: TYPOGRAPHY.semiBold },
  searchWrap: { padding: SPACING.md, paddingTop: SPACING.sm },
  searchInput: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.bodySmall, color: COLORS.textPrimary, ...SHADOWS.sm,
  },
  list: { padding: SPACING.md, paddingBottom: 96 },
});
