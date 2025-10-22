import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type WorkStyle = 'remote' | 'hybrid' | 'onsite';

export interface CoachProfile {
  fullName: string;
  occupation: string;
  workStyle: WorkStyle;
  timezone: string;
  goal: 'fat_loss' | 'maintain' | 'muscle_gain';
  calorieTarget?: number | null;
  heightCm?: number | null;
  weightKg?: number | null;
  age?: number | null;
  gender?: string | null;
  activityLevel?: string | null;
  preferredWindows: string[];
  equipmentAccess: string[];
  dietPreference: 'standard' | 'vegetarian' | 'vegan' | 'pescatarian' | 'gluten_free';
  commuteMinutes?: number | null;
  stressLevel: 'low' | 'moderate' | 'high';
  injuries?: string | null;
  dietaryRestrictions?: string | null;
  dietaryAllergies?: string | null;
  dietaryPreferences?: string | null;
  supplements?: string | null;
  weightGoalShort?: string | null;
  weightGoalLong?: string | null;
  notes?: string;
  lastUpdated: string;
}

const STORAGE_KEY = 'dawarPower.profile';

export const QUICK_START_PRESETS: Record<string, CoachProfile> = {
  hybrid_hustle: {
    fullName: 'Hybrid Hustle',
    occupation: 'Product Manager',
    workStyle: 'hybrid',
    timezone: 'EST',
    goal: 'maintain',
    calorieTarget: 2200,
    age: 33,
    gender: 'female',
    activityLevel: 'moderate',
    preferredWindows: ['pre_work', 'midday', 'evening'],
    equipmentAccess: ['dumbbells', 'bands'],
    dietPreference: 'standard',
    commuteMinutes: 45,
    stressLevel: 'moderate',
    heightCm: 175,
    weightKg: 76,
    injuries: 'Occasional knee tightness',
    dietaryRestrictions: 'shellfish',
    dietaryPreferences: 'Mediterranean flavors',
    supplements: 'Multivitamin, omega-3',
    weightGoalShort: 'Lose 5 lbs in 8 weeks',
    weightGoalLong: 'Maintain tone year-round',
    notes: 'Two office days, travels monthly.',
    lastUpdated: new Date().toISOString(),
  },
  travel_reset: {
    fullName: 'Travel Reset',
    occupation: 'Consultant',
    workStyle: 'onsite',
    timezone: 'PST',
    goal: 'fat_loss',
    calorieTarget: 2000,
    age: 38,
    gender: 'male',
    activityLevel: 'light',
    preferredWindows: ['early_morning', 'late_afternoon', 'weekend'],
    equipmentAccess: ['bodyweight', 'outdoors'],
    dietPreference: 'pescatarian',
    commuteMinutes: 20,
    stressLevel: 'high',
    heightCm: 168,
    weightKg: 68,
    injuries: 'Lower back stiffness',
    dietaryRestrictions: 'dairy',
    dietaryPreferences: 'Seafood, bowls',
    supplements: 'Vitamin D',
    weightGoalShort: 'Drop 10 lbs for summer travel',
    weightGoalLong: 'Improve stamina on client trips',
    notes: 'Hotels most of the week, focus on mobility and HIIT.',
    lastUpdated: new Date().toISOString(),
  },
  home_strength: {
    fullName: 'Home Strength',
    occupation: 'Designer',
    workStyle: 'remote',
    timezone: 'CST',
    goal: 'muscle_gain',
    calorieTarget: 2600,
    age: 29,
    gender: 'non_binary',
    activityLevel: 'high',
    preferredWindows: ['midday', 'evening'],
    equipmentAccess: ['full_gym'],
    dietPreference: 'standard',
    commuteMinutes: 0,
    stressLevel: 'low',
    heightCm: 182,
    weightKg: 82,
    injuries: 'None',
    dietaryPreferences: 'High protein bowls',
    supplements: 'Creatine, whey protein',
    weightGoalShort: 'Add 5 lbs lean mass',
    weightGoalLong: 'Compete in obstacle race',
    notes: 'Garage gym with barbell, loves progressive overload.',
    lastUpdated: new Date().toISOString(),
  },
};

@Injectable({
  providedIn: 'root',
})
export class CoachProfileService {
  private readonly profileSubject = new BehaviorSubject<CoachProfile | null>(this.loadProfile());
  readonly profile$: Observable<CoachProfile | null> = this.profileSubject.asObservable();

  getProfile(): CoachProfile | null {
    return this.profileSubject.value;
  }

  saveProfile(profile: CoachProfile): void {
    const payload: CoachProfile = {
      ...profile,
      lastUpdated: new Date().toISOString(),
    };
    this.persistProfile(payload);
    this.profileSubject.next(payload);
  }

  clearProfile(): void {
    if (this.canAccessStorage()) {
      localStorage.removeItem(STORAGE_KEY);
    }
    this.profileSubject.next(null);
  }

  applyPreset(presetKey: keyof typeof QUICK_START_PRESETS): void {
    const preset = QUICK_START_PRESETS[presetKey];
    if (!preset) {
      return;
    }
    const profile: CoachProfile = {
      ...preset,
      lastUpdated: new Date().toISOString(),
    };
    this.saveProfile(profile);
  }

  private loadProfile(): CoachProfile | null {
    if (!this.canAccessStorage()) {
      return null;
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as CoachProfile;
      if (!parsed.lastUpdated) {
        parsed.lastUpdated = new Date().toISOString();
      }
      return parsed;
    } catch {
      return null;
    }
  }

  private persistProfile(profile: CoachProfile): void {
    if (!this.canAccessStorage()) {
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }

  private canAccessStorage(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }
}
