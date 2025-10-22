export type NutritionGoal = 'fat_loss' | 'maintain' | 'muscle_gain';

export type DietPreference = 'standard' | 'vegetarian' | 'vegan' | 'pescatarian' | 'gluten_free';

export interface MealIdea {
  name: string;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: number;
  description: string;
  tags: string[];
}

export interface MealPlanDay {
  day: string;
  focus: string;
  totalCalories: number;
  meals: MealIdea[];
}

export interface MealPlanSummary {
  targetCalories: number;
  goal: NutritionGoal;
  diet: DietPreference;
  hydrationCups: number;
  highlights: string[];
  tips: string[];
}

export interface MealPlanResponse {
  summary: MealPlanSummary;
  days: MealPlanDay[];
}

export interface MealPlanRequest {
  goal: NutritionGoal;
  calories?: number | null;
  diet: DietPreference;
  days: number;
  restrictions?: string[];
  allergies?: string[];
  preferences?: string;
  supplements?: string;
  weightGoalShort?: string;
  weightGoalLong?: string;
  activityLevel?: string;
}
