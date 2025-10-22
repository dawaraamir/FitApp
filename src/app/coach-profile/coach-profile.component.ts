import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CoachProfile, CoachProfileService } from './coach-profile.service';

interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

@Component({
  selector: 'app-coach-profile',
  templateUrl: './coach-profile.component.html',
  styleUrls: ['./coach-profile.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoachProfileComponent implements OnInit {
  form: FormGroup;
  savedProfile: CoachProfile | null = null;
  saving = false;

  readonly goalOptions: SelectOption[] = [
    { value: 'fat_loss', label: 'Fat loss' },
    { value: 'maintain', label: 'Maintain performance' },
    { value: 'muscle_gain', label: 'Build muscle' },
  ];

  readonly dietOptions: SelectOption[] = [
    { value: 'standard', label: 'Standard' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'pescatarian', label: 'Pescatarian' },
    { value: 'gluten_free', label: 'Gluten free' },
  ];

  readonly genderOptions: SelectOption[] = [
    { value: 'female', label: 'Female' },
    { value: 'male', label: 'Male' },
    { value: 'non_binary', label: 'Non-binary' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' },
  ];

  readonly activityOptions: SelectOption[] = [
    { value: 'sedentary', label: 'Sedentary (little to no exercise)' },
    { value: 'light', label: 'Light (1-2 sessions/week)' },
    { value: 'moderate', label: 'Moderate (3-4 sessions/week)' },
    { value: 'high', label: 'High (5+ sessions/week)' },
  ];

  readonly workStyles: SelectOption[] = [
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'onsite', label: 'On-site' },
  ];

  readonly stressOptions: SelectOption[] = [
    { value: 'low', label: 'Low' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'high', label: 'High' },
  ];

  readonly windowsOptions: SelectOption[] = [
    { value: 'early_morning', label: 'Early morning (5–7 AM)' },
    { value: 'pre_work', label: 'Before work (7–9 AM)' },
    { value: 'midday', label: 'Midday focus block' },
    { value: 'late_afternoon', label: 'Late afternoon reset' },
    { value: 'evening', label: 'Evening (after 6 PM)' },
    { value: 'weekend', label: 'Weekend flexibility' },
  ];

  readonly equipmentOptions: SelectOption[] = [
    { value: 'bodyweight', label: 'Bodyweight only' },
    { value: 'dumbbells', label: 'Dumbbells' },
    { value: 'kettlebell', label: 'Kettlebell' },
    { value: 'bands', label: 'Resistance bands' },
    { value: 'full_gym', label: 'Full gym access' },
    { value: 'outdoors', label: 'Outdoor / running' },
  ];

  constructor(private fb: FormBuilder, private coachProfileService: CoachProfileService) {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      occupation: ['', [Validators.required, Validators.minLength(2)]],
      workStyle: ['hybrid', Validators.required],
      timezone: ['', Validators.required],
      goal: ['maintain', Validators.required],
      calorieTarget: [2200, [Validators.min(1200), Validators.max(4500)]],
      heightCm: [null, [Validators.min(120), Validators.max(250)]],
      weightKg: [null, [Validators.min(40), Validators.max(250)]],
      age: [null, [Validators.min(10), Validators.max(100)]],
      gender: ['prefer_not_to_say'],
      activityLevel: ['moderate'],
      preferredWindows: [[]],
      equipmentAccess: [[]],
      dietPreference: ['standard', Validators.required],
      commuteMinutes: [null, [Validators.min(0), Validators.max(240)]],
      stressLevel: ['moderate', Validators.required],
      injuries: [''],
      dietaryRestrictions: [''],
      dietaryAllergies: [''],
      dietaryPreferences: [''],
      supplements: [''],
      weightGoalShort: [''],
      weightGoalLong: [''],
      notes: [''],
    });
  }

  ngOnInit(): void {
    this.populateFromProfile(this.coachProfileService.getProfile());
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const raw = this.form.value;
    const profile: CoachProfile = {
      fullName: raw.fullName,
      occupation: raw.occupation,
      workStyle: raw.workStyle,
      timezone: raw.timezone,
      goal: raw.goal,
      calorieTarget: this.nullableNumber(raw.calorieTarget),
      heightCm: this.nullableNumber(raw.heightCm),
      weightKg: this.nullableNumber(raw.weightKg),
      age: this.nullableNumber(raw.age),
      gender: raw.gender,
      activityLevel: raw.activityLevel,
      preferredWindows: raw.preferredWindows ?? [],
      equipmentAccess: raw.equipmentAccess ?? [],
      dietPreference: raw.dietPreference,
      commuteMinutes: this.nullableNumber(raw.commuteMinutes),
      stressLevel: raw.stressLevel,
      injuries: raw.injuries,
      dietaryRestrictions: raw.dietaryRestrictions,
      dietaryAllergies: raw.dietaryAllergies,
      dietaryPreferences: raw.dietaryPreferences,
      supplements: raw.supplements,
      weightGoalShort: raw.weightGoalShort,
      weightGoalLong: raw.weightGoalLong,
      notes: raw.notes,
      lastUpdated: new Date().toISOString(),
    };

    this.coachProfileService.saveProfile(profile);
    this.savedProfile = profile;
    this.saving = false;
  }

  clearProfile(): void {
    this.coachProfileService.clearProfile();
    this.form.reset({
      fullName: '',
      occupation: '',
      workStyle: 'hybrid',
      timezone: '',
      goal: 'maintain',
      calorieTarget: 2200,
      heightCm: null,
      weightKg: null,
      age: null,
      gender: 'prefer_not_to_say',
      activityLevel: 'moderate',
      preferredWindows: [],
      equipmentAccess: [],
      dietPreference: 'standard',
      commuteMinutes: null,
      stressLevel: 'moderate',
      injuries: '',
      dietaryRestrictions: '',
      dietaryAllergies: '',
      dietaryPreferences: '',
      supplements: '',
      weightGoalShort: '',
      weightGoalLong: '',
      notes: '',
    });
    this.savedProfile = null;
  }

  trackByValue(_: number, option: SelectOption): string {
    return option.value;
  }

  private nullableNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  onPresetApplied(): void {
    this.populateFromProfile(this.coachProfileService.getProfile());
  }

  private populateFromProfile(profile: CoachProfile | null): void {
    if (!profile) {
      return;
    }

    this.form.patchValue({
      ...profile,
      calorieTarget: profile.calorieTarget ?? null,
      heightCm: profile.heightCm ?? null,
      weightKg: profile.weightKg ?? null,
      age: profile.age ?? null,
      gender: profile.gender ?? 'prefer_not_to_say',
      activityLevel: profile.activityLevel ?? 'moderate',
      commuteMinutes: profile.commuteMinutes ?? null,
      injuries: profile.injuries ?? '',
      dietaryRestrictions: profile.dietaryRestrictions ?? '',
      dietaryAllergies: profile.dietaryAllergies ?? '',
      dietaryPreferences: profile.dietaryPreferences ?? '',
      supplements: profile.supplements ?? '',
      weightGoalShort: profile.weightGoalShort ?? '',
      weightGoalLong: profile.weightGoalLong ?? '',
      notes: profile.notes ?? '',
    });
    this.savedProfile = profile;
  }

  preferredWindowsSummary(profile: CoachProfile): string {
    if (!profile.preferredWindows || profile.preferredWindows.length === 0) {
      return '';
    }
    const map = this.windowsOptions.reduce<Record<string, string>>((acc, opt) => {
      acc[opt.value] = opt.label;
      return acc;
    }, {});
    return profile.preferredWindows.map((value) => map[value] ?? value).join(', ');
  }

  equipmentSummary(profile: CoachProfile): string {
    if (!profile.equipmentAccess || profile.equipmentAccess.length === 0) {
      return 'Bodyweight default';
    }
    const map = this.equipmentOptions.reduce<Record<string, string>>((acc, opt) => {
      acc[opt.value] = opt.label;
      return acc;
    }, {});
    return profile.equipmentAccess.map((value) => map[value] ?? value).join(', ');
  }
}
