/**
 * VitaNova — Diet Screen with Premium Expandable Food Cards
 */
import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfile } from '../../src/providers/ProfileProvider';
import { useNutrition } from '../../src/providers/NutritionProvider';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../src/utils/theme';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import TabTransitionWrapper from '../../src/components/TabTransitionWrapper';
import ExpandableFoodCard from '../../src/components/ExpandableFoodCard';

const CATEGORIES = ['All', 'Fruit', 'Vegetable', 'Grain', 'Protein', 'Dairy', 'Nut'];

const MEAL_PLAN = {
  fat_loss: {
    title: '🔥 Fat Loss Plan',
    meals: [
      { time: '7:00 AM', label: 'Breakfast', items: 'Oats + Banana + Green Tea', icon: '🌅' },
      { time: '10:00 AM', label: 'Snack', items: 'Apple + 5 Almonds', icon: '🍎' },
      { time: '1:00 PM', label: 'Lunch', items: 'Rice + Lentils + Spinach + Salad', icon: '🍱' },
      { time: '4:00 PM', label: 'Snack', items: 'Green Tea + Cucumber', icon: '🥒' },
      { time: '7:30 PM', label: 'Dinner', items: 'Grilled Chicken/Paneer + Veggies', icon: '🥗' },
    ],
  },
  muscle_gain: {
    title: '💪 Muscle Gain Plan',
    meals: [
      { time: '7:00 AM', label: 'Breakfast', items: 'Eggs (3) + Toast + Banana + Milk', icon: '🌅' },
      { time: '10:00 AM', label: 'Snack', items: 'Protein Shake + Almonds', icon: '🥜' },
      { time: '1:00 PM', label: 'Lunch', items: 'Rice + Chicken/Paneer + Dal + Veggies', icon: '🍱' },
      { time: '4:00 PM', label: 'Pre-Workout', items: 'Banana + Sweet Potato', icon: '🍌' },
      { time: '7:30 PM', label: 'Dinner', items: 'Fish/Tofu + Brown Rice + Broccoli', icon: '🥦' },
      { time: '9:30 PM', label: 'Night', items: 'Yogurt + Walnuts', icon: '🌙' },
    ],
  },
  weight_gain: {
    title: '📈 Weight Gain Plan',
    meals: [
      { time: '7:00 AM', label: 'Breakfast', items: 'Paratha + Eggs + Milk + Banana', icon: '🌅' },
      { time: '10:00 AM', label: 'Snack', items: 'Mango Shake + Almonds + Dates', icon: '🥛' },
      { time: '1:00 PM', label: 'Lunch', items: 'Extra Rice + Dal + Paneer + Curd', icon: '🍱' },
      { time: '4:00 PM', label: 'Snack', items: 'Peanut Butter Toast + Banana', icon: '🥜' },
      { time: '7:30 PM', label: 'Dinner', items: 'Chicken/Lentils + Rice + Ghee', icon: '🍛' },
      { time: '9:30 PM', label: 'Night', items: 'Warm Milk + Honey + Walnuts', icon: '🌙' },
    ],
  },
  maintenance: {
    title: '⚖️ Balanced Plan',
    meals: [
      { time: '7:00 AM', label: 'Breakfast', items: 'Oats/Eggs + Fruit + Tea/Coffee', icon: '🌅' },
      { time: '10:00 AM', label: 'Snack', items: 'Seasonal Fruit + Nuts', icon: '🍎' },
      { time: '1:00 PM', label: 'Lunch', items: 'Rice/Roti + Dal + Veggies + Curd', icon: '🍱' },
      { time: '4:00 PM', label: 'Snack', items: 'Green Tea + Light Snack', icon: '🍵' },
      { time: '7:30 PM', label: 'Dinner', items: 'Roti + Sabzi + Salad', icon: '🥗' },
    ],
  },
};

export default function DietScreen() {
  const { colors } = useAppTheme();
  const { profile } = useProfile();
  const { searchFoods, getAllFoods } = useNutrition();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const goal = profile.fitnessGoal || 'maintenance';
  const plan = MEAL_PLAN[goal] || MEAL_PLAN.maintenance;

  const foods = useMemo(() => {
    let list = searchQuery ? searchFoods(searchQuery) : getAllFoods();
    if (activeCategory !== 'All') {
      list = list.filter((f) => f.category?.toLowerCase() === activeCategory.toLowerCase());
    }
    return list.slice(0, 20);
  }, [searchQuery, activeCategory, searchFoods, getAllFoods]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TabTransitionWrapper>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={[styles.title, { color: colors.textPrimary }]}>🥗 Diet Plan</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Personalized for your goals</Text>

        {/* Meal Plan Card */}
        <View style={[styles.planCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.planTitle, { color: colors.textPrimary }]}>{plan.title}</Text>
          <Text style={[styles.planGoal, { color: colors.textSecondary }]}>
            Goal: {goal.replace('_', ' ')}
          </Text>
          {plan.meals.map((meal, i) => (
            <View key={i} style={[styles.mealRow, i < plan.meals.length - 1 && { borderBottomColor: colors.borderLight }]}>
              <Text style={styles.mealIcon}>{meal.icon}</Text>
              <View style={styles.mealInfo}>
                <View style={styles.mealHeader}>
                  <Text style={[styles.mealLabel, { color: colors.textPrimary }]}>{meal.label}</Text>
                  <Text style={[styles.mealTime, { color: colors.textTertiary }]}>{meal.time}</Text>
                </View>
                <Text style={[styles.mealItems, { color: colors.textSecondary }]}>{meal.items}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Food Explorer */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>🔍 Food Explorer</Text>

        {/* Search */}
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search foods..."
          placeholderTextColor={colors.textTertiary}
        />

        {/* Category chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, { backgroundColor: colors.surface }, activeCategory === cat && { backgroundColor: colors.primary }]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.chipText, { color: colors.textSecondary }, activeCategory === cat && { color: '#FFFFFF', fontWeight: 'bold' }]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Food list */}
        {/* Food list — Premium Expandable Cards */}
        {foods.map((food, i) => (
          <ExpandableFoodCard key={food.name || i} food={food} index={i} />
        ))}

        <View style={{ height: 30 }} />
      </ScrollView>
      </TabTransitionWrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.lg, paddingBottom: 96 },
  title: { fontSize: TYPOGRAPHY.h2, color: COLORS.textPrimary, fontFamily: TYPOGRAPHY.poppinsBold },
  subtitle: { fontSize: TYPOGRAPHY.caption, color: COLORS.textSecondary, marginBottom: SPACING.lg, fontFamily: TYPOGRAPHY.poppinsRegular },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg, marginBottom: SPACING.xl, ...SHADOWS.md,
  },
  planTitle: { fontSize: TYPOGRAPHY.h3, color: COLORS.textPrimary, fontFamily: TYPOGRAPHY.poppinsBold, marginBottom: 2 },
  planGoal: {
    fontSize: TYPOGRAPHY.caption, color: COLORS.primary, fontFamily: TYPOGRAPHY.poppinsBold,
    textTransform: 'capitalize', marginBottom: SPACING.md,
  },
  mealRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingVertical: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  mealIcon: { fontSize: 24, marginRight: SPACING.md, marginTop: 2 },
  mealInfo: { flex: 1 },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mealLabel: { fontSize: TYPOGRAPHY.body, color: COLORS.textPrimary, fontFamily: TYPOGRAPHY.poppinsSemiBold },
  mealTime: { fontSize: TYPOGRAPHY.caption, color: COLORS.textTertiary, fontFamily: TYPOGRAPHY.poppinsRegular },
  mealItems: { fontSize: TYPOGRAPHY.bodySmall, color: COLORS.textSecondary, marginTop: 2 },
  sectionTitle: {
    fontSize: TYPOGRAPHY.h4, color: COLORS.textPrimary, fontFamily: TYPOGRAPHY.poppinsBold,
    marginBottom: SPACING.sm,
  },
  searchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.bodySmall, color: COLORS.textPrimary,
    marginBottom: SPACING.sm, ...SHADOWS.sm,
  },
  chipScroll: { marginBottom: SPACING.md },
  chip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full, backgroundColor: COLORS.surfaceAlt,
    marginRight: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  chipText: { fontSize: TYPOGRAPHY.caption, color: COLORS.textSecondary, fontFamily: TYPOGRAPHY.poppinsMedium },
});
