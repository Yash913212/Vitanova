/**
 * VitaNova — User Profile Setup Screen
 * High-fidelity interactive multi-step configuration wizard.
 */
import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, Dimensions, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useProfile } from '../src/providers/ProfileProvider';
import { useSettings } from '../src/providers/SettingsProvider';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../src/utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const GENDERS = [
  { label: '👨 Male', value: 'male' },
  { label: '👩 Female', value: 'female' },
  { label: '🏳️‍🌈 Non-binary', value: 'non_binary' },
  { label: '🤫 Prefer not to say', value: 'no_preference' }
];

const GOALS = [
  { label: '🥗 Maintenance', desc: 'Maintain current body weight and focus on vitality', value: 'maintenance', color: COLORS.primary },
  { label: '🔥 Fat Loss', desc: 'Shed calories and build defined muscle tone', value: 'fat_loss', color: COLORS.accent },
  { label: '💪 Muscle Gain', desc: 'Increase strength indices and lean body mass', value: 'muscle_gain', color: COLORS.success },
  { label: '⚖️ Weight Gain', desc: 'Healthy progressive mass increase', value: 'weight_gain', color: COLORS.warning }
];

const DIETS = [
  { label: '🍎 Balanced', desc: 'No specific restrictions', value: 'no_preference' },
  { label: '🥦 Vegetarian', desc: 'No animal meat, egg friendly', value: 'vegetarian' },
  { label: '🌱 Vegan', desc: 'Strictly plant-based nutrition', value: 'vegan' },
  { label: '🥩 Ketogenic', desc: 'High-fat, ultra-low carbohydrates', value: 'keto' }
];

export default function ProfileSetupScreen() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const { updateProfile } = useProfile();
  const { updateSetting } = useSettings();

  // Physical details state
  const [age, setAge] = useState('25');
  const [gender, setGender] = useState('male');
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('70');
  const [goal, setGoal] = useState('maintenance');
  const [diet, setDiet] = useState('no_preference');

  // Dynamic BMI Calculation
  const bmiInfo = useMemo(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!w || !h) return null;
    const heightInM = h / 100;
    const bmiVal = w / (heightInM * heightInM);
    
    let category = 'Normal';
    let color = COLORS.success;
    if (bmiVal < 18.5) {
      category = 'Underweight';
      color = COLORS.warning;
    } else if (bmiVal >= 25 && bmiVal < 30) {
      category = 'Overweight';
      color = COLORS.accent;
    } else if (bmiVal >= 30) {
      category = 'Obese';
      color = '#FF3B30'; // red
    }
    
    return {
      value: bmiVal.toFixed(1),
      category,
      color
    };
  }, [weight, height]);

  const handleNext = () => {
    if (step === 1) {
      const parsedAge = parseInt(age);
      const parsedHeight = parseFloat(height);
      const parsedWeight = parseFloat(weight);

      if (!parsedAge || parsedAge < 5 || parsedAge > 120) {
        Alert.alert('Invalid Age', 'Please supply a realistic age (5 - 120).');
        return;
      }
      if (!parsedHeight || parsedHeight < 100 || parsedHeight > 250) {
        Alert.alert('Invalid Height', 'Please supply a realistic height (100cm - 250cm).');
        return;
      }
      if (!parsedWeight || parsedWeight < 30 || parsedWeight > 300) {
        Alert.alert('Invalid Weight', 'Please supply a realistic weight (30kg - 300kg).');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSave = async () => {
    const success = await updateProfile({
      age: parseInt(age),
      gender,
      height: parseFloat(height),
      weight: parseFloat(weight),
      goal,
      diet_preference: diet
    });

    if (success) {
      await updateSetting('has_configured_profile', true);
      Alert.alert(
        'Profile Configured 🎉',
        'Your profile metrics have been locked. Caloric and macronutrient benchmarks are set!',
        [{ text: 'Enter Dashboard', onPress: () => router.replace('/(tabs)') }]
      );
    } else {
      Alert.alert('Error', 'Unable to record profile metrics at this time.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Step Header */}
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Configure Profile</Text>
        <Text style={styles.stepIndicators}>Step {step} of 3</Text>
      </View>

      {/* Progress Line */}
      <View style={styles.progressLineWrap}>
        <View style={[styles.progressLine, { width: `${(step / 3) * 100}%`, backgroundColor: COLORS.primary }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Step 1: Body Metrics */}
        {step === 1 && (
          <View style={styles.stepCard}>
            <Text style={styles.sectionTitle}>Physical Parameters ⚖️</Text>
            <Text style={styles.sectionSub}>Provide your physical details to calculate metabolic indices</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>🎂 Age (years)</Text>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>📏 Height (cm)</Text>
              <TextInput
                style={styles.input}
                value={height}
                onChangeText={setHeight}
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>⚖️ Weight (kg)</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>

            {bmiInfo && (
              <View style={[styles.bmiAlert, { borderColor: bmiInfo.color }]}>
                <Text style={styles.bmiLabel}>Estimated Body Mass Index (BMI):</Text>
                <View style={styles.bmiRow}>
                  <Text style={[styles.bmiValue, { color: bmiInfo.color }]}>{bmiInfo.value}</Text>
                  <View style={[styles.bmiBadge, { backgroundColor: bmiInfo.color }]}>
                    <Text style={styles.bmiCategoryText}>{bmiInfo.category}</Text>
                  </View>
                </View>
              </View>
            )}

            <Text style={styles.label}>🧬 Biological Sex</Text>
            <View style={styles.genderGrid}>
              {GENDERS.map((g) => (
                <TouchableOpacity
                  key={g.value}
                  style={[
                    styles.genderCard,
                    gender === g.value && { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '08' }
                  ]}
                  onPress={() => setGender(g.value)}
                >
                  <Text style={styles.genderCardText}>{g.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 2: Goal Preferences */}
        {step === 2 && (
          <View style={styles.stepCard}>
            <Text style={styles.sectionTitle}>Define Wellness Goal 🏆</Text>
            <Text style={styles.sectionSub}>This establishes daily caloric benchmarks and recommended nutrition</Text>

            <View style={styles.optionsCol}>
              {GOALS.map((g) => (
                <TouchableOpacity
                  key={g.value}
                  style={[
                    styles.optionCard,
                    goal === g.value && { borderColor: g.color, backgroundColor: g.color + '05' }
                  ]}
                  onPress={() => setGoal(g.value)}
                  activeOpacity={0.8}
                >
                  <View style={styles.optionHeader}>
                    <Text style={[styles.optionTitle, goal === g.value && { color: g.color }]}>{g.label}</Text>
                    {goal === g.value && <View style={[styles.radioDot, { backgroundColor: g.color }]} />}
                  </View>
                  <Text style={styles.optionDesc}>{g.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 3: Diet Preferences */}
        {step === 3 && (
          <View style={styles.stepCard}>
            <Text style={styles.sectionTitle}>Dietary Preferences 🥗</Text>
            <Text style={styles.sectionSub}>Customizes RAG retrievals and chatbot recommendations</Text>

            <View style={styles.optionsCol}>
              {DIETS.map((d) => (
                <TouchableOpacity
                  key={d.value}
                  style={[
                    styles.optionCard,
                    diet === d.value && { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '05' }
                  ]}
                  onPress={() => setDiet(d.value)}
                  activeOpacity={0.8}
                >
                  <View style={styles.optionHeader}>
                    <Text style={[styles.optionTitle, diet === d.value && { color: COLORS.primary }]}>{d.label}</Text>
                    {diet === d.value && <View style={[styles.radioDot, { backgroundColor: COLORS.primary }]} />}
                  </View>
                  <Text style={styles.optionDesc}>{d.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Wizard Actions Footer */}
      <View style={styles.footer}>
        {step > 1 ? (
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholderBtn} />
        )}

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={step === 3 ? handleSave : handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.actionBtnText}>{step === 3 ? 'Save Setup 🎉' : 'Next Step →'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary
  },
  stepIndicators: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.medium
  },
  progressLineWrap: {
    height: 4,
    backgroundColor: COLORS.border,
    width: '100%',
    marginBottom: SPACING.lg
  },
  progressLine: { height: '100%' },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xxl,
    paddingBottom: 100
  },
  stepCard: {
    flex: 1
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: 6
  },
  sectionSub: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    lineHeight: 20
  },
  inputGroup: {
    marginBottom: SPACING.lg
  },
  label: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    borderWidth: 1.5,
    borderColor: COLORS.border
  },
  genderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginTop: SPACING.xs
  },
  genderCard: {
    width: (SCREEN_WIDTH - 2 * SPACING.xxl - SPACING.md) / 2,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.sm
  },
  genderCardText: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary
  },
  optionsCol: {
    gap: SPACING.lg
  },
  optionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.sm
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  optionTitle: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6
  },
  optionDesc: {
    fontSize: TYPOGRAPHY.bodySmall - 1,
    color: COLORS.textSecondary,
    lineHeight: 18
  },
  bmiAlert: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl
  },
  bmiLabel: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: 4
  },
  bmiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md
  },
  bmiValue: {
    fontSize: 26,
    fontWeight: TYPOGRAPHY.bold
  },
  bmiBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.md
  },
  bmiCategoryText: {
    color: COLORS.textInverse,
    fontSize: TYPOGRAPHY.caption,
    fontWeight: TYPOGRAPHY.bold
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.xl
  },
  backBtn: {
    paddingVertical: 14,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  backText: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textSecondary
  },
  placeholderBtn: {
    width: 100
  },
  actionBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: SPACING.xxl,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.glow(COLORS.primary)
  },
  actionBtnText: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textInverse
  }
});
