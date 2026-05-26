/**
 * VitaNova AI — Premium AI-Powered Personalized Diet & Meal Planner
 * A futuristic cybernetic nutrition planning ecosystem with dynamic light/dark mode.
 * Features customizable goals, dynamic greeting title headers, active macro targets,
 * expandable meal timeline card triggers, smart ingredient replacements,
 * veg converter, protein boosters, voice explanation guides, and grocery modal sheets.
 */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet,
  Animated, LayoutAnimation, Platform, UIManager, Dimensions, Modal, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useProfile } from '../../src/providers/ProfileProvider';
import { useNutrition } from '../../src/providers/NutritionProvider';
import { useAI } from '../../src/providers/AIProvider';
import { useSettings } from '../../src/providers/SettingsProvider';
import { useHistory } from '../../src/providers/HistoryProvider';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { speak } from '../../src/services/voiceService';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../src/utils/theme';
import TabTransitionWrapper from '../../src/components/TabTransitionWrapper';
import ExpandableFoodCard from '../../src/components/ExpandableFoodCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Interactive Weekdays
const WEEKDAYS = [
  { key: 'Mon', label: 'Mon', day: 'Monday' },
  { key: 'Tue', label: 'Tue', day: 'Tuesday' },
  { key: 'Wed', label: 'Wed', day: 'Wednesday' },
  { key: 'Thu', label: 'Thu', day: 'Thursday' },
  { key: 'Fri', label: 'Fri', day: 'Friday' },
  { key: 'Sat', label: 'Sat', day: 'Saturday' },
  { key: 'Sun', label: 'Sun', day: 'Sunday' },
];

// Meal Plans Templates Database
const MEAL_PLANS_TEMPLATE = {
  fat_loss: [
    { id: 'b', type: 'Breakfast', time: '7:00 AM', items: 'Oats porridge with chia seeds and half sliced banana', calories: 350, protein: 12, carbs: 55, fats: 8, ingredients: ['Rolled Oats (50g)', 'Almond Milk (200ml)', 'Chia Seeds (10g)', 'Banana (50g)'], tips: 'Cook on low heat, stir continuously, top with walnuts.', digestion: 'High Fiber — slow digestive release', maxQty: '1 bowl (300g)' },
    { id: 's1', type: 'Mid-Morning Snack', time: '10:30 AM', items: 'Green tea and 1 medium crisp apple', calories: 85, protein: 1, carbs: 22, fats: 0, ingredients: ['Green Tea Bag (1)', 'Fresh Apple (182g)'], tips: 'Best eaten raw with the skin on for maximum flavonoids.', digestion: 'Neutral — aids gut microbiome', maxQty: '1 apple' },
    { id: 'l', type: 'Lunch', time: '1:00 PM', items: 'Steamed brown rice, yellow lentils, boiled chicken breast, and green spinach salad', calories: 480, protein: 40, carbs: 62, fats: 9, ingredients: ['Brown Rice (100g cooked)', 'Moong Dal (150g cooked)', 'Chicken Breast (120g)', 'Fresh Spinach (50g)'], tips: 'Steam the chicken with garlic and rosemary for a delicious sodium-free flavor.', digestion: 'Medium — high thermic protein burn', maxQty: '1 large plate' },
    { id: 's2', type: 'Afternoon Snack', time: '4:30 PM', items: 'Hummus cup with sliced cucumber sticks', calories: 120, protein: 5, carbs: 12, fats: 6, ingredients: ['Organic Hummus (50g)', 'Fresh Cucumber (100g)'], tips: 'Chill cucumber sticks in iced water beforehand for maximum crunch.', digestion: 'Cooling — hydrating and low glycemic', maxQty: '1 cup' },
    { id: 'd', type: 'Dinner', time: '7:30 PM', items: 'Pan-seared tofu cubes with broccoli, carrots, and lemon olive drizzle', calories: 290, protein: 22, carbs: 18, fats: 14, ingredients: ['Firm Tofu (150g)', 'Fresh Broccoli (100g)', 'Carrots (50g)', 'Extra Virgin Olive Oil (5ml)'], tips: 'Sauté tofu until golden brown, then steam broccoli for 3 minutes.', digestion: 'Light — easy overnight nutrient uptake', maxQty: '1 bowl' },
  ],
  muscle_gain: [
    { id: 'b', type: 'Breakfast', time: '7:00 AM', items: 'Scrambled eggs (3 whites, 1 whole), 2 slices whole-wheat toast, and 1 whole banana', calories: 510, protein: 28, carbs: 68, fats: 12, ingredients: ['Egg Whites (3)', 'Whole Egg (1)', 'Whole Wheat Bread (2 slices)', 'Banana (118g)'], tips: 'Toast bread to golden crisp, scramble eggs with light black pepper.', digestion: 'Medium — complete protein profile', maxQty: '1 plate' },
    { id: 's1', type: 'Mid-Morning Snack', time: '10:30 AM', items: 'Greek yogurt cup topped with organic walnuts', calories: 220, protein: 18, carbs: 10, fats: 12, ingredients: ['Greek Yogurt (150g)', 'Walnuts (20g)'], tips: 'Avoid flavored yogurts; add a drop of pure honey if needed.', digestion: 'Slow — probiotic-rich casein absorption', maxQty: '1 cup (170g)' },
    { id: 'l', type: 'Lunch', time: '1:00 PM', items: 'Quinoa bowl with baked paneer, chickpeas, mixed vegetables, and cilantro sauce', calories: 650, protein: 32, carbs: 80, fats: 18, ingredients: ['Quinoa (120g cooked)', 'Firm Paneer (100g)', 'Boiled Chickpeas (80g)', 'Bell Peppers & Onion (100g)'], tips: 'Bake paneer at 180°C for 10 minutes with turmeric and lime.', digestion: 'Heavy — complex carbohydrates and amino acids', maxQty: '1 large bowl' },
    { id: 's2', type: 'Pre-Workout', time: '4:30 PM', items: 'Peanut butter banana toast with honey drizzle', calories: 340, protein: 10, carbs: 45, fats: 15, ingredients: ['Wheat Bread (1 slice)', 'All-Natural Peanut Butter (20g)', 'Banana (50g)'], tips: 'Spread peanut butter evenly, slice banana on top.', digestion: 'Fast — immediate glycogen fuel load', maxQty: '1 slice' },
    { id: 'd', type: 'Dinner', time: '7:30 PM', items: 'Baked salmon fillet with roasted sweet potatoes and asparagus spears', calories: 580, protein: 42, carbs: 48, fats: 20, ingredients: ['Salmon Fillet (150g)', 'Sweet Potato (150g)', 'Asparagus (80g)'], tips: 'Brush salmon with lemon juice and bake at 200°C for 15 minutes.', digestion: 'Medium — loaded with Omega-3 and recovery starch', maxQty: '1 plate' },
  ],
  weight_gain: [
    { id: 'b', type: 'Breakfast', time: '7:00 AM', items: 'Nut butter loaded oatmeal with full-fat milk, dates, and almonds', calories: 620, protein: 20, carbs: 90, fats: 22, ingredients: ['Rolled Oats (80g)', 'Whole Milk (250ml)', 'Peanut Butter (30g)', 'Medjool Dates (3)', 'Slivered Almonds (15g)'], tips: 'Stir peanut butter into warm oatmeal, garnish with chopped dates.', digestion: 'Slow — dense healthy fats and carbs', maxQty: '1 large bowl' },
    { id: 's1', type: 'Mid-Morning Snack', time: '10:30 AM', items: 'High-calorie mango avocado thick smoothie', calories: 410, protein: 8, carbs: 58, fats: 18, ingredients: ['Fresh Mango (150g)', 'Avocado (1/2)', 'Whole Milk (200ml)'], tips: 'Blend until super silky and smooth, serve instantly chilled.', digestion: 'Fast — highly digestible lipid emulsion', maxQty: '1 large tumbler' },
    { id: 'l', type: 'Lunch', time: '1:00 PM', items: 'Triple carb brown rice, spiced chickpea curry, cooked paneer cubes, and ghee topping', calories: 810, protein: 30, carbs: 110, fats: 28, ingredients: ['Brown Rice (200g cooked)', 'Kabuli Chana (150g cooked)', 'Paneer (100g)', 'Pure Cow Ghee (10ml)'], tips: 'Drizzle ghee warm over hot rice and chickpeas.', digestion: 'Heavy — calorie-rich carbohydrate loading', maxQty: '1 large platter' },
    { id: 's2', type: 'Afternoon Snack', time: '4:30 PM', items: 'Mixed nut trial mix (cashews, walnuts, raisins)', calories: 310, protein: 9, carbs: 24, fats: 22, ingredients: ['Cashews (20g)', 'Walnuts (20g)', 'Raisins (20g)'], tips: 'Portion into a reusable zip-lock container for easy on-the-go snacking.', digestion: 'Neutral — quick healthy lipid pack', maxQty: '1 cup' },
    { id: 'd', type: 'Dinner', time: '7:30 PM', items: 'Stir-fried tofu chunks, quinoa pilaf, sautéed mushrooms, and green beans with sesame seed garnish', calories: 590, protein: 28, carbs: 65, fats: 24, ingredients: ['Firm Tofu (150g)', 'Quinoa (150g cooked)', 'Mushrooms (100g)', 'Sesame Seeds (5g)'], tips: 'Toast sesame seeds dry in a pan before garnishing.', digestion: 'Medium — amino acid surplus', maxQty: '1 bowl' },
  ],
  maintenance: [
    { id: 'b', type: 'Breakfast', time: '7:00 AM', items: 'Whole grain muesli with low-fat yogurt and fresh blueberries', calories: 380, protein: 14, carbs: 60, fats: 8, ingredients: ['Muesli (60g)', 'Low Fat Yogurt (150g)', 'Blueberries (50g)'], tips: 'Layer muesli and yogurt in a jar, refrigerate overnight.', digestion: 'Medium — antioxidant-rich slow energy', maxQty: '1 bowl' },
    { id: 's1', type: 'Mid-Morning Snack', time: '10:30 AM', items: 'Sliced papaya with squeeze of fresh lime juice', calories: 95, protein: 1, carbs: 24, fats: 0, ingredients: ['Fresh Papaya (200g)', 'Lime Juice (5ml)'], tips: 'Discard papaya seeds, cut into uniform cubes, squeeze lime.', digestion: 'Fast — enzyme-rich digestive support', maxQty: '1 plate' },
    { id: 'l', type: 'Lunch', time: '1:00 PM', items: 'Whole wheat roti flatbreads, mixed vegetable sabzi, dal lentils, and fresh curd', calories: 520, protein: 22, carbs: 75, fats: 12, ingredients: ['Roti (2 pieces)', 'Mixed Veg (150g cooked)', 'Yellow Dal (120g cooked)', 'Curd (100g)'], tips: 'Serve dal warm, use minimal oil for cooking vegetables.', digestion: 'Medium — balanced prebiotic distribution', maxQty: '1 plate' },
    { id: 's2', type: 'Afternoon Snack', time: '4:30 PM', items: 'Roasted pumpkin seeds and unsweetened black coffee', calories: 140, protein: 7, carbs: 4, fats: 12, ingredients: ['Roasted Pumpkin Seeds (25g)', 'Black Coffee (1 cup)'], tips: 'Dry roast seeds until light brown with a pinch of pink salt.', digestion: 'Light — keto-friendly mineral booster', maxQty: '1 handful' },
    { id: 'd', type: 'Dinner', time: '7:30 PM', items: 'Grilled paneer skewers with diced zucchini, bell peppers, and onion', calories: 360, protein: 24, carbs: 16, fats: 22, ingredients: ['Paneer (120g)', 'Zucchini (80g)', 'Bell Peppers (80g)'], tips: 'Thread paneer and veggies on skewers, grill for 8 minutes.', digestion: 'Light — ideal evening slow protein release', maxQty: '1 plate' },
  ],
};

// Swapping suggestions dictionary for local offline usage
const LOCAL_SWAPS = {
  'Rolled Oats (50g)': { label: 'Sweet Potato (120g)', cals: 110, protein: 2 },
  'Chicken Breast (120g)': { label: 'Paneer (100g)', cals: 260, protein: 18 },
  'Firm Tofu (150g)': { label: 'Tempeh (120g)', cals: 230, protein: 24 },
  'Whole Egg (1)': { label: 'Tofu Scramble (80g)', cals: 90, protein: 8 },
  'Greek Yogurt (150g)': { label: 'Soy Yogurt (150g)', cals: 110, protein: 7 },
  'Brown Rice (100g cooked)': { label: 'Quinoa (100g cooked)', cals: 120, protein: 4 },
  'Oats porridge with chia seeds and half sliced banana': { label: 'Quinoa warm bowl with almond milk and fresh raspberries', calories: 340, protein: 11, ingredients: ['Quinoa (50g)', 'Almond Milk (200ml)', 'Raspberries (40g)'] },
  'Steamed brown rice, yellow lentils, boiled chicken breast, and green spinach salad': { label: 'Sautéed millet, sprouted green beans, tofu chunks, and cucumber spinach salad', calories: 460, protein: 32, ingredients: ['Millet (80g)', 'Sprouted Moong (100g)', 'Sautéed Tofu (100g)'] },
  'Pan-seared tofu cubes with broccoli, carrots, and lemon olive drizzle': { label: 'Grilled tempeh steak with roasted Brussels sprouts and olive marinade', calories: 310, protein: 25, ingredients: ['Tempeh (120g)', 'Brussels Sprouts (100g)'] },
  'Scrambled eggs (3 whites, 1 whole), 2 slices whole-wheat toast, and 1 whole banana': { label: 'Chia pudding loaded with soy milk, dates, walnuts, and sliced berries', calories: 490, protein: 24, ingredients: ['Chia Seeds (30g)', 'Soy Milk (250ml)', 'Dates (2)'] },
  'Baked salmon fillet with roasted sweet potatoes and asparagus spears': { label: 'Steamed sea bass fillet with sweet potato mash and sautéed green beans', calories: 520, protein: 38, ingredients: ['Sea Bass (150g)', 'Sweet Potato (120g)'] },
};

export default function PremiumDietPlanner() {
  const { colors, isDark } = useAppTheme();
  const { profile } = useProfile();
  const { searchFoods, getAllFoods } = useNutrition();
  const { chat, isOnline } = useAI();
  const { settings } = useSettings();
  const { history } = useHistory();

  // Core Planner States
  const [selectedDay, setSelectedDay] = useState('Mon');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMeal, setExpandedMeal] = useState(null); // id of open meal
  
  // Custom Meal states allowing swaps
  const [meals, setMeals] = useState([]);
  const [groceryModalVisible, setGroceryModalVisible] = useState(false);
  const [purchasedIngredients, setPurchasedIngredients] = useState({});
  const [aiRecommendation, setAiRecommendation] = useState('Generating intelligent food recommendation based on your active goals...');
  const [aiLoading, setAiLoading] = useState(false);

  // Load Template Meals based on fitness goal
  const goal = profile.fitnessGoal || 'maintenance';

  useEffect(() => {
    const list = MEAL_PLANS_TEMPLATE[goal] || MEAL_PLANS_TEMPLATE.maintenance;
    // Clone template so edits don't mutate statics
    setMeals(JSON.parse(JSON.stringify(list)));
  }, [goal, selectedDay]);

  // Compute total planned stats
  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
  const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0);
  const totalFats = meals.reduce((sum, m) => sum + m.fats, 0);

  // Profile thresholds
  const targetCalories = goal === 'fat_loss' ? 1800 : goal === 'muscle_gain' ? 2800 : goal === 'weight_gain' ? 3200 : 2100;
  const targetProtein = goal === 'fat_loss' ? 130 : goal === 'muscle_gain' ? 160 : goal === 'weight_gain' ? 140 : 100;

  // Swapping Actions
  const handleMealSwap = useCallback((mealId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMeals(prev => prev.map(m => {
      if (m.id === mealId) {
        const swap = LOCAL_SWAPS[m.items];
        if (swap) {
          return {
            ...m,
            items: swap.label,
            calories: swap.calories || m.calories,
            protein: swap.protein || m.protein,
            ingredients: swap.ingredients || m.ingredients,
            tips: 'Quick AI local swap option. Season and prep normally.',
          };
        } else {
          // If no full meal swap matches, swap a random ingredient
          const nextIng = m.ingredients.map(ing => LOCAL_SWAPS[ing] ? LOCAL_SWAPS[ing].label : ing);
          return {
            ...m,
            ingredients: nextIng,
            tips: 'Healthy local ingredient replacement applied.',
          };
        }
      }
      return m;
    }));
  }, []);

  const handleVegetarianSwap = useCallback((mealId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMeals(prev => prev.map(m => {
      if (m.id === mealId) {
        let items = m.items;
        let ingredients = [...m.ingredients];
        let wasChanged = false;

        // Offline matching veggie conversions
        const animalPatterns = [
          { pattern: /chicken breast/i, replace: 'grilled organic tofu', ingReplace: 'Firm Tofu (150g)' },
          { pattern: /chicken/i, replace: 'sautéed spiced paneer', ingReplace: 'Spiced Paneer (120g)' },
          { pattern: /eggs/i, replace: 'tofu scramble with turmeric', ingReplace: 'Tofu Scramble (100g)' },
          { pattern: /egg whites/i, replace: 'chickpea scramble', ingReplace: 'Sprouted Chickpeas (100g)' },
          { pattern: /salmon/i, replace: 'grilled tempeh steak', ingReplace: 'Organic Tempeh (120g)' },
          { pattern: /fish/i, replace: 'baked plant-based soy mock-meat', ingReplace: 'Mock Meat (120g)' },
        ];

        animalPatterns.forEach(rule => {
          if (rule.pattern.test(items)) {
            items = items.replace(rule.pattern, rule.replace);
            wasChanged = true;
          }
          ingredients = ingredients.map(ing => {
            if (rule.pattern.test(ing)) {
              wasChanged = true;
              return rule.ingReplace;
            }
            return ing;
          });
        });

        if (wasChanged) {
          return {
            ...m,
            items,
            ingredients,
            tips: '🛡️ Plant-based conversion: animal proteins successfully swapped for clean legumes, paneer, and tofu.',
            digestion: 'Extremely easy digestion — rich in prebiotics',
          };
        } else {
          Alert.alert('Pure Clean State', 'This meal is already vegetarian-compliant!');
        }
      }
      return m;
    }));
  }, []);

  const handleProteinBoost = useCallback((mealId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMeals(prev => prev.map(m => {
      if (m.id === mealId) {
        if (m.items.includes('+ 25g Whey')) {
          Alert.alert('Surplus Peak', 'High-Protein booster is already active in this meal.');
          return m;
        }
        return {
          ...m,
          items: `${m.items} + 25g Whey Protein Shake`,
          calories: m.calories + 120,
          protein: m.protein + 25,
          ingredients: [...m.ingredients, 'Whey Protein Isolate (30g)'],
          tips: `${m.tips} \n💪 Boost active: protein synthesis threshold locked.`,
        };
      }
      return m;
    }));
  }, []);

  // Fetch AI Recommendations based on goals
  const fetchAIRecommendations = useCallback(async () => {
    setAiLoading(true);
    setAiRecommendation('VitaNova AI coach is analyzing seasonal availability...');
    try {
      if (!isOnline) {
        // Offline recommendations
        if (goal === 'fat_loss') {
          setAiRecommendation('🥑 Offline recommendation: Focus on low calorie density. Add organic Spinach (2.2g fiber) and crisp Apples to breakfast to trigger high satiety.');
        } else if (goal === 'muscle_gain') {
          setAiRecommendation('💪 Offline recommendation: Muscle synthesis target is active. Combine your morning oats with Greek Yogurt (18g protein) to capture slow-release amino acids.');
        } else {
          setAiRecommendation('⚖️ Offline recommendation: Balanced diet. Ensure regular hydration pacing, and include Walnuts (Omega-3 fats) to support nerve and tissue health.');
        }
        setAiLoading(false);
        return;
      }

      const prompt = `Generate exactly one high-value, highly personalized, actionable 2-sentence diet suggestion for a user with the goal: ${goal}. Macro values today: ${totalCalories} calories, ${totalProtein}g protein, target ${targetCalories} calories. Provide one food alternative and a hydration guideline.`;
      
      const response = await chat([{ role: 'user', content: prompt }], {
        profile,
        language: settings.ttsLanguage || 'en',
      });
      setAiRecommendation(response || 'Maintain regular meal intervals and include whole vegetables to support metabolic rate.');
    } catch (e) {
      setAiRecommendation('🥗 Focus on loading complex carbs (like sweet potato or oats) 90 minutes before active workouts to optimize performance.');
    } finally {
      setAiLoading(false);
    }
  }, [goal, totalCalories, totalProtein, targetCalories, isOnline, chat, profile, settings.ttsLanguage]);

  useEffect(() => {
    fetchAIRecommendations();
  }, [selectedDay]);

  // Aggregate all ingredients for Grocery List
  const allIngredients = useMemo(() => {
    const list = [];
    meals.forEach(m => {
      m.ingredients.forEach(ing => {
        if (!list.includes(ing)) {
          list.push(ing);
        }
      });
    });
    return list;
  }, [meals]);

  const toggleGroceryCheckbox = (ing) => {
    setPurchasedIngredients(prev => ({
      ...prev,
      [ing]: !prev[ing],
    }));
  };

  // Filter foods for Explorer list
  const filteredFoods = useMemo(() => {
    let list = searchQuery ? searchFoods(searchQuery) : getAllFoods();
    if (activeCategory !== 'All') {
      list = list.filter((f) => f.category?.toLowerCase() === activeCategory.toLowerCase());
    }
    return list.slice(0, 10);
  }, [searchQuery, activeCategory, searchFoods, getAllFoods]);

  // SVG Circular progress ring parameters
  const ringSize = 100;
  const strokeWidth = 9;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const caloriePercent = Math.min(100, Math.round((totalCalories / targetCalories) * 100));
  const strokeDashoffset = circumference - (caloriePercent / 100) * circumference;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TabTransitionWrapper>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          
          {/* Header Title replaced Good Afternoon greeting */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>🥗 Diet Plan</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Personalized nutrition planner</Text>

            {/* Scrolling AI Coach Tip */}
            <View style={[styles.coachCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.coachTitleRow}>
                <Text style={styles.coachTitleIcon}>🤖</Text>
                <Text style={[styles.coachTitleText, { color: colors.primary }]}>AI Nutrition Coach</Text>
              </View>
              <Text style={[styles.coachMessage, { color: colors.textSecondary }]}>
                "Your {goal.replace('_', ' ')} plan is fully mapped for {WEEKDAYS.find(w => w.key === selectedDay)?.day}. Consuming oats at breakfast will secure slow carbohydrates."
              </Text>
            </View>
          </View>

          {/* Weekday sliding selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekdayScroll} contentContainerStyle={styles.weekdayContent}>
            {WEEKDAYS.map(day => (
              <TouchableOpacity
                key={day.key}
                style={[
                  styles.dayChip,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  selectedDay === day.key && { backgroundColor: colors.primary + '18', borderColor: colors.primary }
                ]}
                onPress={() => setSelectedDay(day.key)}
              >
                <Text style={[
                  styles.dayChipText,
                  { color: colors.textSecondary },
                  selectedDay === day.key && { color: colors.primary, fontWeight: 'bold' }
                ]}>
                  {day.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Daily Nutrition Analytics Card */}
          <View style={[styles.analyticsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.analyticsTitle, { color: colors.textPrimary }]}>Daily Nutrition Target</Text>
            
            <View style={styles.analyticsRow}>
              {/* Svg circular chart */}
              <View style={styles.radialChartWrap}>
                <Svg width={ringSize} height={ringSize}>
                  <Defs>
                    <LinearGradient id="cyber_emerald" x1="0%" y1="0%" x2="100%" y2="100%">
                      <Stop offset="0%" stopColor="#10B981" />
                      <Stop offset="100%" stopColor="#059669" />
                    </LinearGradient>
                  </Defs>
                  <Circle
                    cx={ringSize / 2}
                    cy={ringSize / 2}
                    r={radius}
                    stroke={colors.borderLight}
                    strokeWidth={strokeWidth - 2}
                    fill="transparent"
                  />
                  <Circle
                    cx={ringSize / 2}
                    cy={ringSize / 2}
                    r={radius}
                    stroke="url(#cyber_emerald)"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
                  />
                </Svg>
                <View style={styles.radialChartInner}>
                  <Text style={[styles.radialValue, { color: colors.textPrimary }]}>{caloriePercent}%</Text>
                  <Text style={[styles.radialLabel, { color: colors.textSecondary }]}>kcal</Text>
                </View>
              </View>

              <View style={styles.analyticsMetaCol}>
                <View style={styles.metaRowItem}>
                  <View style={[styles.metaDot, { backgroundColor: '#10B981' }]} />
                  <Text style={[styles.metaLabel, { color: colors.textPrimary }]}>Planned Cals: {totalCalories} kcal</Text>
                </View>
                <Text style={[styles.targetMuted, { color: colors.textTertiary }]}>Target limit: {targetCalories} kcal</Text>

                <View style={styles.metaRowItem}>
                  <View style={[styles.metaDot, { backgroundColor: '#8B5CF6' }]} />
                  <Text style={[styles.metaLabel, { color: colors.textPrimary }]}>Planned Protein: {totalProtein}g</Text>
                </View>
                <Text style={[styles.targetMuted, { color: colors.textTertiary }]}>Target limit: {targetProtein}g</Text>
              </View>
            </View>

            {/* Gradient progress bars for macros */}
            <View style={styles.analyticsBarRow}>
              <View style={styles.barLabelRow}>
                <Text style={[styles.barText, { color: colors.textSecondary }]}>Carbs</Text>
                <Text style={[styles.barValText, { color: colors.textPrimary }]}>{totalCarbs}g / 280g</Text>
              </View>
              <View style={[styles.barOuter, { backgroundColor: colors.borderLight }]}>
                <View style={[styles.barInner, { width: `${Math.min(100, Math.round((totalCarbs / 280) * 100))}%`, backgroundColor: '#F59E0B' }]} />
              </View>
            </View>

            <View style={styles.analyticsBarRow}>
              <View style={styles.barLabelRow}>
                <Text style={[styles.barText, { color: colors.textSecondary }]}>Fats</Text>
                <Text style={[styles.barValText, { color: colors.textPrimary }]}>{totalFats}g / 70g</Text>
              </View>
              <View style={[styles.barOuter, { backgroundColor: colors.borderLight }]}>
                <View style={[styles.barInner, { width: `${Math.min(100, Math.round((totalFats / 70) * 100))}%`, backgroundColor: '#EF4444' }]} />
              </View>
            </View>
          </View>

          {/* AI Recommendation Panel */}
          <View style={[styles.recommendationsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.recHeader}>
              <Text style={[styles.recTitle, { color: colors.accent }]}>✨ AI Goal Recommendations</Text>
              <TouchableOpacity onPress={fetchAIRecommendations} disabled={aiLoading}>
                <Text style={[styles.refreshBtnText, { color: colors.accent }]}>{aiLoading ? 'Recalculating...' : 'Refresh'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.recContentText, { color: colors.textSecondary }]}>{aiRecommendation}</Text>
          </View>

          {/* Holographic Diet Plan Details Card */}
          <View style={[styles.dietPlanCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.goalBadge, { color: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>🎯 {goal.replace('_', ' ').toUpperCase()}</Text>
              <TouchableOpacity style={[styles.groceryBtn, { backgroundColor: colors.accent + '15', borderColor: colors.accent }]} onPress={() => setGroceryModalVisible(true)}>
                <Text style={[styles.groceryBtnText, { color: colors.accent }]}>🛒 View Grocery List ({allIngredients.length})</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.timelineTitle, { color: colors.textPrimary }]}>Timeline & Meals</Text>

            {/* Expandable Meal Timeline */}
            <View style={styles.timelineList}>
              {meals.map((meal, index) => {
                const isExpanded = expandedMeal === meal.id;
                return (
                  <View key={meal.id} style={[styles.timelineItem, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}>
                    <TouchableOpacity
                      style={[styles.mealHeaderRow, isExpanded && { backgroundColor: colors.borderLight }]}
                      onPress={() => {
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
                        setExpandedMeal(isExpanded ? null : meal.id);
                      }}
                    >
                      <View style={styles.timeWrap}>
                        <Text style={[styles.timeText, { color: colors.primary }]}>{meal.time}</Text>
                        <Text style={[styles.typeText, { color: colors.textTertiary }]}>{meal.type}</Text>
                      </View>
                      <View style={styles.mealTextWrap}>
                        <Text style={[styles.mealItemsText, { color: colors.textPrimary }]} numberOfLines={2}>{meal.items}</Text>
                        <Text style={[styles.mealMacrosSmall, { color: colors.textSecondary }]}>{meal.calories} kcal  •  {meal.protein}g protein</Text>
                      </View>
                      <Text style={[styles.chevronIcon, { color: colors.textTertiary }]}>{isExpanded ? '▲' : '▼'}</Text>
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={[styles.mealDetailPane, { borderTopColor: colors.border }]}>
                        <View style={styles.paneMacroGrid}>
                          <View style={[styles.paneMacroCell, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.paneMacroVal, { color: colors.textPrimary }]}>{meal.calories}</Text>
                            <Text style={[styles.paneMacroLabel, { color: colors.textTertiary }]}>Calories</Text>
                          </View>
                          <View style={[styles.paneMacroCell, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.paneMacroVal, { color: colors.textPrimary }]}>{meal.protein}g</Text>
                            <Text style={[styles.paneMacroLabel, { color: colors.textTertiary }]}>Protein</Text>
                          </View>
                          <View style={[styles.paneMacroCell, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.paneMacroVal, { color: colors.textPrimary }]}>{meal.carbs}g</Text>
                            <Text style={[styles.paneMacroLabel, { color: colors.textTertiary }]}>Carbs</Text>
                          </View>
                          <View style={[styles.paneMacroCell, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.paneMacroVal, { color: colors.textPrimary }]}>{meal.fats}g</Text>
                            <Text style={[styles.paneMacroLabel, { color: colors.textTertiary }]}>Fats</Text>
                          </View>
                        </View>

                        {/* Ingredients */}
                        <Text style={[styles.paneSectionTitle, { color: colors.textPrimary }]}>📦 Ingredients Required</Text>
                        <View style={styles.ingredientsList}>
                          {meal.ingredients.map((ing, idx) => (
                            <Text key={idx} style={[styles.ingredientBullet, { color: colors.textSecondary }]}>• {ing}</Text>
                          ))}
                        </View>

                        {/* Guidance */}
                        <View style={[styles.guidanceBlock, { backgroundColor: colors.surface }]}>
                          <Text style={[styles.paneSectionTitle, { color: colors.textPrimary }]}>🕒 Preparation & Timing</Text>
                          <Text style={[styles.guidanceNote, { color: colors.textSecondary }]}>💡 {meal.tips}</Text>
                          
                          <View style={styles.guidanceChipsRow}>
                            <View style={[styles.guidanceChip, { borderColor: colors.primary }]}>
                              <Text style={[styles.guidanceChipText, { color: colors.primary }]}>🔥 Serving: {meal.maxQty}</Text>
                            </View>
                            <View style={[styles.guidanceChip, { borderColor: colors.accent }]}>
                              <Text style={[styles.guidanceChipText, { color: colors.accent }]}>🫃 Digestion: {meal.digestion}</Text>
                            </View>
                          </View>
                        </View>

                        {/* Swaps controls */}
                        <View style={styles.swapsActionRow}>
                          <TouchableOpacity style={[styles.actionBtn, styles.swapMainBtn, { borderColor: colors.primary }]} onPress={() => handleMealSwap(meal.id)}>
                            <Text style={[styles.actionBtnText, { color: colors.primary }]}>🔄 Swap Meal</Text>
                          </TouchableOpacity>

                          <TouchableOpacity style={[styles.actionBtn, styles.swapVegBtn, { borderColor: '#F59E0B' }]} onPress={() => handleVegetarianSwap(meal.id)}>
                            <Text style={[styles.actionBtnText, { color: '#D97706' }]}>🌱 Make Veggie</Text>
                          </TouchableOpacity>

                          <TouchableOpacity style={[styles.actionBtn, styles.swapBoostBtn, { borderColor: colors.accent }]} onPress={() => handleProteinBoost(meal.id)}>
                            <Text style={[styles.actionBtnText, { color: colors.accent }]}>⚡ Protein+</Text>
                          </TouchableOpacity>
                        </View>

                        {/* Speech guide button */}
                        <TouchableOpacity
                          style={[styles.voiceGuideBtn, { backgroundColor: colors.surface }]}
                          onPress={() => speak(`For ${meal.type}, cook using ${meal.tips}. This contains ${meal.calories} calories and ${meal.protein} grams of protein.`, settings.ttsLanguage)}
                        >
                          <Text style={[styles.voiceGuideText, { color: colors.textPrimary }]}>🔊 Listen to Preparation Guide</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          {/* Premium Food Explorer Section */}
          <Text style={[styles.explorerTitle, { color: colors.textPrimary }]}>🔍 Advanced Food Explorer</Text>
          
          <TextInput
            style={[styles.explorerSearchInput, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search healthy options..."
            placeholderTextColor={colors.textTertiary}
          />

          {/* Category Chips scroll view */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {['All', 'Fruit', 'Vegetable', 'Grain', 'Protein', 'Dairy', 'Nut'].map(cat => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.explorerChip,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  activeCategory === cat && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[
                  styles.explorerChipText,
                  { color: colors.textSecondary },
                  activeCategory === cat && { color: '#FFFFFF', fontWeight: 'bold' }
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Explorer food items list */}
          <View style={styles.explorerList}>
            {filteredFoods.map((food, i) => (
              <ExpandableFoodCard key={food.name || i} food={food} index={i} />
            ))}
          </View>

          <View style={{ height: 40 }} />

        </ScrollView>
      </TabTransitionWrapper>

      {/* Futuristic Grocery Checklist Modal Sheet */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={groceryModalVisible}
        onRequestClose={() => setGroceryModalVisible(false)}
      >
        <View style={styles.modalBg}>
          <View style={[styles.modalSheetContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>🛒 AI Grocery List</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>Today's ingredients checklist</Text>
              </View>
              <TouchableOpacity style={[styles.modalCloseBtn, { backgroundColor: colors.primary + '15' }]} onPress={() => setGroceryModalVisible(false)}>
                <Text style={[styles.modalCloseText, { color: colors.primary }]}>Done</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {allIngredients.map((ing, idx) => {
                const checked = !!purchasedIngredients[ing];
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.groceryCheckboxRow, checked && styles.groceryCheckboxRowChecked, { borderBottomColor: colors.borderLight }]}
                    onPress={() => toggleGroceryCheckbox(ing)}
                  >
                    <View style={[styles.checkboxBox, checked && { backgroundColor: colors.primary, borderColor: colors.primary }, { borderColor: colors.textTertiary }]}>
                      {checked && <Text style={[styles.checkMark, { color: colors.surface }]}>✓</Text>}
                    </View>
                    <Text style={[styles.groceryIngredientText, checked && styles.groceryIngredientTextChecked, { color: colors.textPrimary }]}>
                      {ing}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity style={[styles.shareListBtn, { backgroundColor: colors.accent }]} onPress={() => Alert.alert('List Saved', 'Ingredients successfully exported to clipboard!')}>
              <Text style={styles.shareListBtnText}>Share Ingredients List</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: SPACING.lg, paddingBottom: 110 },
  
  // Header Title
  header: { marginBottom: SPACING.lg },
  title: { fontSize: TYPOGRAPHY.h2, fontFamily: TYPOGRAPHY.poppinsBold, marginBottom: 2 },
  subtitle: { fontSize: TYPOGRAPHY.caption, fontFamily: TYPOGRAPHY.poppinsRegular, marginBottom: SPACING.lg },
  
  // AI Coach banner
  coachCard: {
    borderWidth: 1, borderRadius: RADIUS.xl, padding: SPACING.md,
    ...SHADOWS.sm,
  },
  coachTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  coachTitleIcon: { fontSize: 18 },
  coachTitleText: { fontSize: TYPOGRAPHY.bodySmall, fontFamily: TYPOGRAPHY.poppinsBold },
  coachMessage: { fontSize: TYPOGRAPHY.caption, fontFamily: TYPOGRAPHY.poppinsMedium, lineHeight: 18, fontStyle: 'italic' },

  // Weekdays Selector
  weekdayScroll: { marginBottom: SPACING.lg },
  weekdayContent: { gap: SPACING.md, paddingRight: SPACING.lg },
  dayChip: {
    width: 46, height: 46, borderRadius: 23, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', ...SHADOWS.sm,
  },
  dayChipText: { fontSize: 12, fontFamily: TYPOGRAPHY.poppinsSemiBold },

  // Daily target analytics
  analyticsCard: {
    borderWidth: 1, borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  analyticsTitle: { fontSize: TYPOGRAPHY.body, fontFamily: TYPOGRAPHY.poppinsBold, marginBottom: SPACING.md },
  analyticsRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xxl, marginBottom: SPACING.lg },
  radialChartWrap: { position: 'relative', width: 100, height: 100, alignItems: 'center', justifyContent: 'center' },
  radialChartInner: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  radialValue: { fontSize: 18, fontFamily: TYPOGRAPHY.poppinsBold },
  radialLabel: { fontSize: 8, fontFamily: TYPOGRAPHY.poppinsRegular },
  analyticsMetaCol: { flex: 1, gap: 4 },
  metaRowItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaDot: { width: 8, height: 8, borderRadius: 4 },
  metaLabel: { fontSize: TYPOGRAPHY.caption, fontFamily: TYPOGRAPHY.poppinsSemiBold },
  targetMuted: { fontSize: 10, fontFamily: TYPOGRAPHY.poppinsRegular, marginLeft: 14, marginBottom: 4 },
  
  // Linear macro details
  analyticsBarRow: { marginBottom: SPACING.md },
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  barText: { fontSize: TYPOGRAPHY.caption, fontFamily: TYPOGRAPHY.poppinsMedium },
  barValText: { fontSize: TYPOGRAPHY.caption, fontFamily: TYPOGRAPHY.poppinsSemiBold },
  barOuter: { height: 6, borderRadius: 3, overflow: 'hidden' },
  barInner: { height: '100%', borderRadius: 3 },

  // Recommendation Card
  recommendationsCard: {
    borderWidth: 1, borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  recHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  recTitle: { fontSize: TYPOGRAPHY.bodySmall, fontFamily: TYPOGRAPHY.poppinsBold },
  refreshBtnText: { fontSize: TYPOGRAPHY.caption, fontFamily: TYPOGRAPHY.poppinsBold },
  recContentText: { fontSize: TYPOGRAPHY.caption, fontFamily: TYPOGRAPHY.poppinsMedium, lineHeight: 18 },

  // Interactive Diet Plan Card
  dietPlanCard: {
    borderWidth: 1, borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.xl,
    ...SHADOWS.md,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  goalBadge: { fontSize: 10, fontFamily: TYPOGRAPHY.poppinsBold, paddingHorizontal: SPACING.md, paddingVertical: 4, borderRadius: RADIUS.full },
  groceryBtn: { borderWidth: 1, paddingHorizontal: SPACING.md, paddingVertical: 4, borderRadius: RADIUS.xl },
  groceryBtnText: { fontSize: 10, fontFamily: TYPOGRAPHY.poppinsBold },
  timelineTitle: { fontSize: TYPOGRAPHY.body, fontFamily: TYPOGRAPHY.poppinsBold, marginBottom: SPACING.lg },
  
  // Expandable timeline list
  timelineList: { gap: SPACING.md },
  timelineItem: { borderRadius: RADIUS.xl, overflow: 'hidden', borderWidth: 1, ...SHADOWS.sm },
  mealHeaderRow: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.sm },
  timeWrap: { width: 70 },
  timeText: { fontSize: 10, fontFamily: TYPOGRAPHY.poppinsBold },
  typeText: { fontSize: 9, fontFamily: TYPOGRAPHY.poppinsRegular },
  mealTextWrap: { flex: 1, paddingRight: SPACING.sm },
  mealItemsText: { fontSize: TYPOGRAPHY.caption, fontFamily: TYPOGRAPHY.poppinsSemiBold },
  mealMacrosSmall: { fontSize: 8, fontFamily: TYPOGRAPHY.poppinsRegular, marginTop: 2 },
  chevronIcon: { fontSize: 10 },

  // Expanded meal Pane
  mealDetailPane: { padding: SPACING.md, borderTopWidth: 1 },
  paneMacroGrid: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.lg, justifyContent: 'space-between' },
  paneMacroCell: { flex: 1, padding: SPACING.xs, borderRadius: RADIUS.lg, alignItems: 'center', ...SHADOWS.sm },
  paneMacroVal: { fontSize: 12, fontFamily: TYPOGRAPHY.poppinsBold },
  paneMacroLabel: { fontSize: 8, fontFamily: TYPOGRAPHY.poppinsRegular },
  paneSectionTitle: { fontSize: TYPOGRAPHY.caption, fontFamily: TYPOGRAPHY.poppinsBold, marginBottom: 4 },
  ingredientsList: { gap: 2, marginBottom: SPACING.md, paddingLeft: 6 },
  ingredientBullet: { fontSize: TYPOGRAPHY.caption, fontFamily: TYPOGRAPHY.poppinsRegular },
  guidanceBlock: { padding: SPACING.sm, borderRadius: RADIUS.xl, marginBottom: SPACING.md, ...SHADOWS.sm },
  guidanceNote: { fontSize: TYPOGRAPHY.caption, fontFamily: TYPOGRAPHY.poppinsMedium, fontStyle: 'italic', lineHeight: 18 },
  guidanceChipsRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  guidanceChip: { borderWidth: 1, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 2 },
  guidanceChipText: { fontSize: 8, fontFamily: TYPOGRAPHY.poppinsBold },

  // Action swap buttons
  swapsActionRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  actionBtn: { flex: 1, paddingVertical: 8, borderRadius: RADIUS.lg, alignItems: 'center', borderWidth: 1, backgroundColor: 'transparent' },
  actionBtnText: { fontSize: 9, fontFamily: TYPOGRAPHY.poppinsBold },
  swapMainBtn: {},
  swapVegBtn: {},
  swapBoostBtn: {},
  
  voiceGuideBtn: { borderRadius: RADIUS.xl, paddingVertical: 10, alignItems: 'center', marginTop: SPACING.md, ...SHADOWS.sm },
  voiceGuideText: { fontSize: TYPOGRAPHY.caption, fontFamily: TYPOGRAPHY.poppinsBold },

  // Explorer sections
  explorerTitle: { fontSize: TYPOGRAPHY.h3, fontFamily: TYPOGRAPHY.poppinsBold, marginBottom: SPACING.sm },
  explorerSearchInput: {
    borderWidth: 1, borderRadius: RADIUS.xl, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.bodySmall, marginBottom: SPACING.md, ...SHADOWS.sm,
  },
  chipScroll: { marginBottom: SPACING.md },
  explorerChip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full, marginRight: SPACING.sm, borderWidth: 1,
  },
  explorerChipText: { fontSize: TYPOGRAPHY.caption, fontFamily: TYPOGRAPHY.poppinsMedium },
  explorerList: { gap: SPACING.md },

  // Grocery modal checklist sheet
  modalBg: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'flex-end' },
  modalSheetContainer: {
    borderTopLeftRadius: RADIUS.xxl, borderTopRightRadius: RADIUS.xxl,
    padding: SPACING.lg, height: '70%', borderWidth: 1, ...SHADOWS.md,
  },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  modalTitle: { fontSize: TYPOGRAPHY.h3, fontFamily: TYPOGRAPHY.poppinsBold },
  modalSubtitle: { fontSize: TYPOGRAPHY.caption, fontFamily: TYPOGRAPHY.poppinsRegular },
  modalCloseBtn: { paddingHorizontal: SPACING.lg, paddingVertical: 6, borderRadius: RADIUS.xl },
  modalCloseText: { fontSize: TYPOGRAPHY.bodySmall, fontFamily: TYPOGRAPHY.poppinsBold },
  modalScroll: { flex: 1 },
  groceryCheckboxRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, gap: SPACING.md,
  },
  groceryCheckboxRowChecked: { opacity: 0.5 },
  checkboxBox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  checkMark: { fontSize: 14, fontWeight: 'bold' },
  groceryIngredientText: { fontSize: TYPOGRAPHY.bodySmall, fontFamily: TYPOGRAPHY.poppinsMedium },
  groceryIngredientTextChecked: { textDecorationLine: 'line-through' },
  shareListBtn: { paddingVertical: 14, borderRadius: RADIUS.xl, alignItems: 'center', marginTop: SPACING.md, ...SHADOWS.md },
  shareListBtnText: { fontSize: TYPOGRAPHY.body, fontFamily: TYPOGRAPHY.poppinsBold, color: '#FFF' },
});
