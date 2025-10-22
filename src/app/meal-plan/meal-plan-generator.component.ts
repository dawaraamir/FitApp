import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { MealPlanService } from './meal-plan.service';
import {
  DietPreference,
  MealIdea,
  MealPlanDay,
  MealPlanRequest,
  MealPlanResponse,
  NutritionGoal,
} from './meal-plan.model';
import { CoachProfile, CoachProfileService } from '../coach-profile/coach-profile.service';

interface SelectOption<T> {
  value: T;
  label: string;
}

@Component({
  selector: 'app-meal-plan-generator',
  templateUrl: './meal-plan-generator.component.html',
  styleUrls: ['./meal-plan-generator.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealPlanGeneratorComponent implements OnInit, OnDestroy {
  form: FormGroup;
  plan?: MealPlanResponse;
  loading = false;
  errorMessage = '';
  private readonly destroy$ = new Subject<void>();
  private currentProfile: CoachProfile | null = null;

  readonly goals: SelectOption<NutritionGoal>[] = [
    { value: 'fat_loss', label: 'Fat loss' },
    { value: 'maintain', label: 'Maintenance' },
    { value: 'muscle_gain', label: 'Muscle gain' },
  ];

  readonly diets: SelectOption<DietPreference>[] = [
    { value: 'standard', label: 'Standard' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'pescatarian', label: 'Pescatarian' },
    { value: 'gluten_free', label: 'Gluten free' },
  ];

  readonly dayOptions = [3, 4, 5];

  private readonly mealIcons: Record<string, string> = {
    Breakfast: 'wb_sunny',
    Lunch: 'lunch_dining',
    Dinner: 'dinner_dining',
    Snack: 'local_cafe',
  };

  constructor(
    private fb: FormBuilder,
    private mealPlanService: MealPlanService,
    private coachProfileService: CoachProfileService
  ) {
    this.form = this.fb.group({
      goal: ['maintain', Validators.required],
      calories: [2200, [Validators.min(1200), Validators.max(4500)]],
      diet: ['standard', Validators.required],
      days: [3, [Validators.min(1), Validators.max(5)]],
    });

    this.currentProfile = this.coachProfileService.getProfile();
    this.applyProfileDefaults(this.currentProfile);
  }

  ngOnInit(): void {
    this.loadDefaultPlan();
    this.coachProfileService.profile$
      .pipe(takeUntil(this.destroy$))
      .subscribe((profile) => {
        this.currentProfile = profile;
        this.applyProfileDefaults(profile);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get summary() {
    return this.plan?.summary;
  }

  generate(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.toPayload();
    this.loading = true;
    this.errorMessage = '';
    this.mealPlanService
      .generatePlan(payload)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (plan) => (this.plan = plan),
        error: () => (this.errorMessage = 'Unable to generate a meal plan right now. Try again in a moment.'),
      });
  }

  iconForMealType(meal: MealIdea): string {
    return this.mealIcons[meal.mealType] ?? 'restaurant';
  }

  goalLabel(goal: NutritionGoal): string {
    return this.goals.find((option) => option.value === goal)?.label ?? goal;
  }

  dietLabel(diet: DietPreference): string {
    return this.diets.find((option) => option.value === diet)?.label ?? diet;
  }

  trackByMeal(_: number, meal: MealIdea): string {
    return `${meal.mealType}-${meal.name}`;
  }

  trackByDay(_: number, day: MealPlanDay): string {
    return day.day;
  }

  private loadDefaultPlan(): void {
    this.loading = true;
    this.errorMessage = '';
    this.mealPlanService
      .getSamplePlan()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (plan) => (this.plan = plan),
        error: () =>
          (this.errorMessage =
            'Trouble loading the sample plan. Adjust the inputs and generate a fresh set.'),
      });
  }

  private toPayload(): MealPlanRequest {
    const raw = this.form.value;
    const calories =
      raw.calories === null || raw.calories === undefined || raw.calories === ''
        ? null
        : Number(raw.calories);

    return {
      goal: raw.goal,
      calories,
      diet: raw.diet,
      days: raw.days,
      restrictions: this.parseList(this.currentProfile?.dietaryRestrictions),
      allergies: this.parseList(this.currentProfile?.dietaryAllergies),
      preferences: this.currentProfile?.dietaryPreferences ?? undefined,
      supplements: this.currentProfile?.supplements ?? undefined,
      weightGoalShort: this.currentProfile?.weightGoalShort ?? undefined,
      weightGoalLong: this.currentProfile?.weightGoalLong ?? undefined,
      activityLevel: this.currentProfile?.activityLevel ?? undefined,
    };
  }

  private applyProfileDefaults(profile: CoachProfile | null): void {
    if (!profile) {
      return;
    }

    const patch: Partial<MealPlanRequest> & { calories?: number | null } = {
      goal: profile.goal,
      diet: profile.dietPreference,
    };

    if (profile.calorieTarget) {
      patch.calories = profile.calorieTarget;
    } else {
      const estimated = this.estimateCalories(profile);
      if (estimated) {
        patch.calories = estimated;
      }
    }

    if (profile.preferredWindows?.length) {
      const baseDays = Math.min(5, Math.max(3, profile.preferredWindows.length));
      patch.days = baseDays;
    }

    this.form.patchValue(patch, { emitEvent: false });
  }

  private estimateCalories(profile: CoachProfile): number | null {
    if (!profile.weightKg) {
      return null;
    }

    const weightLbs = profile.weightKg * 2.20462;
    const multiplier =
      profile.goal === 'fat_loss' ? 12 : profile.goal === 'muscle_gain' ? 16 : 14;
    return Math.round(weightLbs * multiplier);
  }

  private parseList(value?: string | null): string[] {
    if (!value) {
      return [];
    }
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => !!item);
  }
}
