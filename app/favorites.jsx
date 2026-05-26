import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../src/hooks/useAppTheme';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../src/utils/theme';
import NUTRITION_DB from '../src/data/nutritionDB';
import {
  addFavoriteAsync,
  removeFavoriteAsync,
  getFavoritesAsync,
  isFavoriteAsync
} from '../src/services/sqlite/database';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'all', label: '🌍 All Foods' },
  { id: 'favorites', label: '⭐ Favorites' },
  { id: 'fruit', label: '🍓 Fruits' },
  { id: 'vegetable', label: '🥦 Veggies' },
  { id: 'protein', label: '🍗 Proteins' },
  { id: 'grain', label: '🌾 Grains' },
  { id: 'dairy', label: '🥛 Dairy' },
  { id: 'hydration', label: '💧 Hydration' },
  { id: 'nut', label: '🥜 Nuts' },
];

export default function FavoritesScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();

  // State Management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favoritesList, setFavoritesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all favorites from SQLite on Mount
  const loadFavorites = useCallback(async () => {
    try {
      const favKeys = await getFavoritesAsync();
      setFavoritesList(favKeys);
    } catch (e) {
      console.warn('Failed to load favorites from SQLite:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Handle Add/Remove Favorite
  const handleToggleFavorite = async (foodKey) => {
    const isFav = favoritesList.includes(foodKey);
    if (isFav) {
      const updated = favoritesList.filter(k => k !== foodKey);
      setFavoritesList(updated);
      await removeFavoriteAsync(foodKey);
    } else {
      const updated = [...favoritesList, foodKey];
      setFavoritesList(updated);
      await addFavoriteAsync(foodKey);
    }
  };

  // Filter & Search Logic
  const filteredFoods = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return Object.entries(NUTRITION_DB).map(([key, food]) => ({
      key,
      ...food,
      isFavorite: favoritesList.includes(key),
    })).filter((food) => {
      // 1. Search Query Filter
      const matchesSearch =
        food.name.toLowerCase().includes(query) ||
        food.category.toLowerCase().includes(query) ||
        food.benefits.toLowerCase().includes(query);

      // 2. Category Tab Filter
      let matchesCategory = true;
      if (selectedCategory === 'favorites') {
        matchesCategory = food.isFavorite;
      } else if (selectedCategory !== 'all') {
        matchesCategory = food.category === selectedCategory;
      }

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, favoritesList]);

  // Navigate to standard details layout
  const handleViewDetails = (foodItem) => {
    const detailPayload = {
      item: foodItem.name,
      confidence: 1.0,
      summary: foodItem.benefits,
      imageUri: null,
      nutritionSnapshot: {
        name: foodItem.name,
        category: foodItem.category,
        calories: foodItem.calories,
        protein: foodItem.protein,
        carbs: foodItem.carbs,
        fiber: foodItem.fiber,
        fats: foodItem.fats,
        vitamins: foodItem.vitamins,
        minerals: foodItem.minerals,
        benefits: foodItem.benefits,
        bestTime: foodItem.bestTime,
        recommendedQty: foodItem.recommendedQty,
        hydration: foodItem.hydration,
      },
      aiRecommendation: foodItem.benefits,
    };

    router.push({
      pathname: '/nutrition-details',
      params: { data: JSON.stringify(detailPayload) },
    });
  };

  // Render a single premium food item card
  const renderFoodItem = ({ item }) => {
    // Elegant color matching for food categories
    let categoryBorder = colors.border;
    let categoryBg = colors.surfaceAlt;
    if (item.category === 'fruit') {
      categoryBorder = 'rgba(239, 68, 68, 0.2)';
      categoryBg = 'rgba(239, 68, 68, 0.08)';
    } else if (item.category === 'vegetable') {
      categoryBorder = 'rgba(16, 185, 129, 0.2)';
      categoryBg = 'rgba(16, 185, 129, 0.08)';
    } else if (item.category === 'protein') {
      categoryBorder = 'rgba(59, 130, 246, 0.2)';
      categoryBg = 'rgba(59, 130, 246, 0.08)';
    } else if (item.category === 'grain') {
      categoryBorder = 'rgba(245, 158, 11, 0.2)';
      categoryBg = 'rgba(245, 158, 11, 0.08)';
    }

    return (
      <TouchableOpacity
        style={[styles.foodCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => handleViewDetails(item)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.foodName, { color: colors.textPrimary }]}>{item.name}</Text>
            <View style={[styles.categoryBadge, { backgroundColor: categoryBg, borderColor: categoryBorder }]}>
              <Text style={[styles.categoryText, { color: colors.textSecondary }]}>
                {item.category.toUpperCase()}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            onPress={() => handleToggleFavorite(item.key)}
            style={[styles.favoriteBtn, { backgroundColor: item.isFavorite ? '#F59E0B20' : colors.surfaceAlt }]}
          >
            <Text style={{ fontSize: 18 }}>{item.isFavorite ? '⭐' : '☆'}</Text>
          </TouchableOpacity>
        </View>

        {/* Benefits text */}
        <Text style={[styles.benefitsText, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.benefits}
        </Text>

        {/* Dynamic macro panel */}
        <View style={[styles.macroRow, { backgroundColor: colors.surfaceAlt }]}>
          <View style={styles.macroPill}>
            <Text style={[styles.macroVal, { color: colors.textPrimary }]}>{item.calories}</Text>
            <Text style={[styles.macroLabel, { color: colors.textTertiary }]}>kcal</Text>
          </View>
          <View style={styles.macroDivider} />
          <View style={styles.macroPill}>
            <Text style={[styles.macroVal, { color: '#3B82F6' }]}>{item.protein}g</Text>
            <Text style={[styles.macroLabel, { color: colors.textTertiary }]}>Protein</Text>
          </View>
          <View style={styles.macroDivider} />
          <View style={styles.macroPill}>
            <Text style={[styles.macroVal, { color: '#F59E0B' }]}>{item.carbs}g</Text>
            <Text style={[styles.macroLabel, { color: colors.textTertiary }]}>Carbs</Text>
          </View>
          <View style={styles.macroDivider} />
          <View style={styles.macroPill}>
            <Text style={[styles.macroVal, { color: '#10B981' }]}>{item.fats}g</Text>
            <Text style={[styles.macroLabel, { color: colors.textTertiary }]}>Fats</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header section */}
      <View style={styles.header}>
        <TouchableOpacity style={[styles.backBtn, { borderColor: colors.border }]} onPress={() => router.back()}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Dashboard</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>⭐ Favorite Foods</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Search and manage your healthy food library
          </Text>
        </View>
      </View>

      {/* Elegant Real-Time Search Bar */}
      <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Search foods, categories, or benefits..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
            <Text style={[styles.clearBtnText, { color: colors.textTertiary }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Horizontal Category Filtering Tabs */}
      <View style={styles.categoriesWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => {
            const isActive = selectedCategory === item.id;
            return (
              <TouchableOpacity
                onPress={() => setSelectedCategory(item.id)}
                style={[
                  styles.categoryTab,
                  {
                    backgroundColor: isActive ? colors.primary : colors.surface,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryTabLabel,
                    {
                      color: isActive ? '#FFFFFF' : colors.textSecondary,
                      fontFamily: isActive ? TYPOGRAPHY.poppinsBold : TYPOGRAPHY.poppinsMedium,
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Main Foods List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredFoods.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🍽️</Text>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Foods Found</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            {selectedCategory === 'favorites'
              ? "You haven't favorited any foods in this category yet. Tap the star icon on any food to save it!"
              : "Try adjusting your search keywords or switching filters."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredFoods}
          keyExtractor={(item) => item.key}
          renderItem={renderFoodItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  backText: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontFamily: TYPOGRAPHY.poppinsBold,
  },
  titleContainer: {
    marginTop: 4,
  },
  title: {
    fontSize: TYPOGRAPHY.h2,
    fontFamily: TYPOGRAPHY.poppinsBold,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.caption,
    fontFamily: TYPOGRAPHY.poppinsMedium,
    marginTop: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    borderWidth: 1,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.md,
    height: 48,
    ...SHADOWS.sm,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.bodySmall,
    fontFamily: TYPOGRAPHY.poppinsMedium,
  },
  clearBtn: {
    padding: SPACING.xs,
  },
  clearBtnText: {
    fontSize: TYPOGRAPHY.body,
    fontFamily: TYPOGRAPHY.poppinsBold,
  },
  categoriesWrapper: {
    marginBottom: SPACING.md,
  },
  categoriesList: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  categoryTab: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    ...SHADOWS.sm,
  },
  categoryTabLabel: {
    fontSize: TYPOGRAPHY.caption,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.huge,
    gap: SPACING.md,
  },
  foodCard: {
    borderWidth: 1,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  foodName: {
    fontSize: TYPOGRAPHY.body,
    fontFamily: TYPOGRAPHY.poppinsBold,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    marginTop: SPACING.xs,
  },
  categoryText: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.poppinsBold,
    letterSpacing: 0.5,
  },
  favoriteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitsText: {
    fontSize: TYPOGRAPHY.caption,
    fontFamily: TYPOGRAPHY.poppinsMedium,
    lineHeight: 16,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
  },
  macroPill: {
    flex: 1,
    alignItems: 'center',
  },
  macroVal: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontFamily: TYPOGRAPHY.poppinsBold,
  },
  macroLabel: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.poppinsMedium,
    marginTop: 1,
  },
  macroDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.huge,
    gap: SPACING.sm,
    marginTop: 48,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.body,
    fontFamily: TYPOGRAPHY.poppinsBold,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.caption,
    fontFamily: TYPOGRAPHY.poppinsMedium,
    textAlign: 'center',
    lineHeight: 18,
  },
});
