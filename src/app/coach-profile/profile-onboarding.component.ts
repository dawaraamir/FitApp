import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { CoachProfile, CoachProfileService } from './coach-profile.service';

@Component({
  selector: 'app-profile-onboarding',
  templateUrl: './profile-onboarding.component.html',
  styleUrls: ['./profile-onboarding.component.css'],
})
export class ProfileOnboardingComponent {
  @Output() completed = new EventEmitter<void>();

  readonly workStyles = [
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'onsite', label: 'On-site' },
  ];

  readonly goalOptions = [
    { value: 'fat_loss', label: 'Fat loss momentum' },
    { value: 'maintain', label: 'Performance maintenance' },
    { value: 'muscle_gain', label: 'Build lean muscle' },
  ];

  readonly windowOptions = [
    { value: 'early_morning', label: 'Early morning (5–7 AM)' },
    { value: 'pre_work', label: 'Before work (7–9 AM)' },
    { value: 'midday', label: 'Midday focus block' },
    { value: 'late_afternoon', label: 'Late afternoon reset' },
    { value: 'evening', label: 'Evening (after 6 PM)' },
    { value: 'weekend', label: 'Weekend flexibility' },
  ];

  readonly equipmentOptions = [
    { value: 'bodyweight', label: 'Bodyweight' },
    { value: 'dumbbells', label: 'Dumbbells' },
    { value: 'kettlebell', label: 'Kettlebell' },
    { value: 'bands', label: 'Resistance bands' },
    { value: 'full_gym', label: 'Full gym' },
    { value: 'outdoors', label: 'Outdoor / run' },
  ];

  readonly dietOptions = [
    { value: 'standard', label: 'Standard' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'pescatarian', label: 'Pescatarian' },
    { value: 'gluten_free', label: 'Gluten free' },
  ];

  identityGroup: FormGroup;
  scheduleGroup: FormGroup;
  nutritionGroup: FormGroup;
  saving = false;

  constructor(private fb: FormBuilder, private coachProfileService: CoachProfileService) {
    this.identityGroup = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      occupation: ['', [Validators.required, Validators.minLength(2)]],
      workStyle: ['hybrid', Validators.required],
      goal: ['maintain', Validators.required],
      timezone: ['', Validators.required],
    });

    this.scheduleGroup = this.fb.group({
      preferredWindows: [[]],
      equipmentAccess: [[]],
      activityLevel: ['moderate', Validators.required],
      stressLevel: ['moderate', Validators.required],
    });

    this.nutritionGroup = this.fb.group({
      dietPreference: ['standard', Validators.required],
      calorieTarget: [2200, [Validators.min(1200), Validators.max(4500)]],
      dietaryRestrictions: [''],
      dietaryPreferences: [''],
    });
  }

  submit(stepper?: MatStepper): void {
    if (this.identityGroup.invalid || this.scheduleGroup.invalid || this.nutritionGroup.invalid) {
      this.identityGroup.markAllAsTouched();
      this.scheduleGroup.markAllAsTouched();
      this.nutritionGroup.markAllAsTouched();
      return;
    }

    this.saving = true;
    const identity = this.identityGroup.value;
    const schedule = this.scheduleGroup.value;
    const nutrition = this.nutritionGroup.value;

    const profile: CoachProfile = {
      fullName: identity.fullName,
      occupation: identity.occupation,
      workStyle: identity.workStyle,
      timezone: identity.timezone,
      goal: identity.goal,
      calorieTarget: this.toNullableNumber(nutrition.calorieTarget),
      heightCm: null,
      weightKg: null,
      age: null,
      gender: 'prefer_not_to_say',
      activityLevel: schedule.activityLevel,
      preferredWindows: schedule.preferredWindows ?? [],
      equipmentAccess: schedule.equipmentAccess ?? [],
      dietPreference: nutrition.dietPreference,
      commuteMinutes: null,
      stressLevel: schedule.stressLevel,
      injuries: '',
      dietaryRestrictions: nutrition.dietaryRestrictions,
      dietaryAllergies: '',
      dietaryPreferences: nutrition.dietaryPreferences,
      supplements: '',
      weightGoalShort: '',
      weightGoalLong: '',
      notes: '',
      lastUpdated: new Date().toISOString(),
    };

    this.coachProfileService.saveProfile(profile);
    this.saving = false;
    if (stepper) {
      stepper.reset();
    }
    this.completed.emit();
  }

  private toNullableNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
}
