/**
 * NutriVision AI — Offline Rule-Based Guidance Engine
 */

/**
 * Generate personalized guidance based on nutrition data and user profile.
 */
export function generateGuidance(nutritionData, profile) {
  if (!nutritionData) {
    return {
      summary: 'No nutrition data available for this item.',
      isGoodForGoal: null,
      dailyRecommendation: '',
      timing: '',
      quantity: '',
      warnings: [],
      tips: [],
    };
  }

  const goal = profile?.fitnessGoal || 'maintenance';
  const diet = profile?.dietPreference || 'no_preference';
  const name = nutritionData.name;

  const guidance = {
    summary: '',
    isGoodForGoal: true,
    dailyRecommendation: '',
    timing: nutritionData.bestTime || 'Any time of day',
    quantity: nutritionData.recommendedQty || 'Moderate portion',
    warnings: [],
    tips: [],
  };

  // Goal-specific analysis
  const cals = nutritionData.calories;
  const protein = nutritionData.protein;
  const carbs = nutritionData.carbs;
  const fats = nutritionData.fats;
  const fiber = nutritionData.fiber;

  switch (goal) {
    case 'fat_loss':
      if (cals > 200) {
        guidance.isGoodForGoal = false;
        guidance.summary = `${name} is calorie-dense at ${cals} kcal per 100g. Consume in moderation for fat loss.`;
        guidance.warnings.push('High calorie — limit portion size');
      } else if (fiber > 3) {
        guidance.summary = `${name} is excellent for fat loss! Low calorie (${cals} kcal) and high in fiber (${fiber}g).`;
        guidance.tips.push('High fiber keeps you full longer');
      } else {
        guidance.summary = `${name} is a reasonable choice for fat loss at ${cals} kcal per 100g.`;
      }
      if (protein > 10) guidance.tips.push('Good protein content supports muscle preservation');
      break;

    case 'muscle_gain':
      if (protein > 10) {
        guidance.summary = `${name} is great for muscle gain with ${protein}g protein per 100g!`;
        guidance.tips.push('Pair with complex carbs for optimal recovery');
      } else if (carbs > 15) {
        guidance.summary = `${name} provides good energy (${carbs}g carbs) to fuel your workouts.`;
        guidance.tips.push('Good as pre-workout fuel');
      } else {
        guidance.summary = `${name} is a healthy addition but low in protein. Pair it with a protein source.`;
        guidance.warnings.push('Low protein — supplement with protein-rich foods');
      }
      break;

    case 'weight_gain':
      if (cals > 150) {
        guidance.summary = `${name} is calorie-rich (${cals} kcal) — great for healthy weight gain.`;
        guidance.tips.push('Can be consumed more liberally');
      } else {
        guidance.summary = `${name} is low in calories. Add healthy fats or combine with calorie-dense foods.`;
        guidance.tips.push('Add nut butter, cheese, or oil to increase calories');
      }
      break;

    default: // maintenance
      guidance.summary = `${name} is a nutritious choice with ${cals} kcal, ${protein}g protein, and ${carbs}g carbs per 100g.`;
      if (fiber > 3) guidance.tips.push('Great fiber content for digestive health');
      if (nutritionData.hydration > 85) guidance.tips.push('Excellent for hydration');
  }

  // Diet compatibility
  if (diet === 'vegetarian' || diet === 'vegan') {
    if (nutritionData.category === 'protein' &&
        ['chicken', 'fish', 'egg'].some(m => name.toLowerCase().includes(m))) {
      guidance.warnings.push(`Not suitable for ${diet} diet`);
      guidance.isGoodForGoal = false;
    }
  }
  if (diet === 'keto' && carbs > 10) {
    guidance.warnings.push('High in carbs — not ideal for keto');
  }

  // Benefits
  guidance.benefits = nutritionData.benefits || '';

  // Daily recommendation
  guidance.dailyRecommendation = `You can include ${name} ${
    guidance.isGoodForGoal ? 'regularly' : 'occasionally'
  } in your diet. ${nutritionData.recommendedQty || ''}`;

  return guidance;
}

/**
 * Answer a specific question using rule-based logic.
 */
export function answerQuestion(question, nutritionData, profile) {
  if (!nutritionData) return "I don't have nutrition data for that item.";

  const q = question.toLowerCase();
  const name = nutritionData.name;
  const goal = profile?.fitnessGoal || 'maintenance';

  if (q.includes('fat loss') || q.includes('lose weight') || q.includes('weight loss')) {
    if (nutritionData.calories < 100 && nutritionData.fiber > 2) {
      return `Yes! ${name} is excellent for fat loss — low in calories (${nutritionData.calories} kcal) and high in fiber. It'll keep you full.`;
    }
    if (nutritionData.calories > 200) {
      return `${name} is calorie-dense (${nutritionData.calories} kcal per 100g). Eat it in small portions if you're trying to lose fat.`;
    }
    return `${name} can fit into a fat loss diet. At ${nutritionData.calories} kcal per 100g, just watch your portion size.`;
  }

  if (q.includes('daily') || q.includes('every day')) {
    return `Yes, you can eat ${name} daily! Recommended: ${nutritionData.recommendedQty}. Best time: ${nutritionData.bestTime}.`;
  }

  if (q.includes('when') || q.includes('time') || q.includes('timing')) {
    return `Best time to eat ${name}: ${nutritionData.bestTime}.`;
  }

  if (q.includes('how much') || q.includes('quantity') || q.includes('portion')) {
    return `Recommended quantity for ${name}: ${nutritionData.recommendedQty}.`;
  }

  if (q.includes('gym') || q.includes('workout') || q.includes('exercise')) {
    if (nutritionData.protein > 10) {
      return `${name} is great for gym-goers! It has ${nutritionData.protein}g protein per 100g. Ideal post-workout.`;
    }
    if (nutritionData.carbs > 15) {
      return `${name} provides good energy (${nutritionData.carbs}g carbs) for workouts. Best as a pre-workout meal.`;
    }
    return `${name} is a healthy choice. Pair it with a protein source for optimal gym results.`;
  }

  if (q.includes('diabetic') || q.includes('diabetes') || q.includes('sugar')) {
    if (nutritionData.carbs > 15) {
      return `${name} has ${nutritionData.carbs}g carbs per 100g — diabetics should consume it in moderation and monitor blood sugar.`;
    }
    return `${name} is relatively low in carbs (${nutritionData.carbs}g) — generally safe for diabetics in reasonable portions.`;
  }

  if (q.includes('benefit') || q.includes('good for') || q.includes('healthy')) {
    return `${name} benefits: ${nutritionData.benefits}`;
  }

  // Generic answer
  const guidance = generateGuidance(nutritionData, profile);
  return guidance.summary;
}
