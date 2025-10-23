import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CoachProfile } from '../coach-profile/coach-profile.service';
import { environment } from '../../environments/environment';
import { MealPlanResponse } from '../meal-plan/meal-plan.model';

const API_BASE = environment.apiBaseUrl;
const SCHEDULE_ENDPOINT = `${API_BASE}/schedule`;
const WELLNESS_ENDPOINT = `${API_BASE}/wellness-sync`;
const WELLNESS_IMPORT_ENDPOINT = `${API_BASE}/wellness-sync/import`;
const RECOMMENDATION_ENDPOINT = `${API_BASE}/coach/recommendation`;

export interface ScheduledSession {
  day: string;
  window: string;
  focus: string;
  durationMinutes: number;
  equipment: string;
  intensity: string;
}

export interface ScheduleNotes {
  summary: string;
  recoveryTip: string;
  mealAlignment: string;
}

export interface ScheduleResponse {
  sessions: ScheduledSession[];
  notes: ScheduleNotes;
  insights: string[];
}

export interface WellnessMetricPayload {
  timestamp: string;
  source?: string | null;
  steps?: number | null;
  sleepHours?: number | null;
  readiness?: number | null;
  energyLevel?: string | null;
  comment?: string | null;
}

export interface CoachAction {
  headline: string;
  description: string;
}

export interface CoachRecommendation {
  profileHash: string;
  schedule: ScheduleResponse;
  mealPlan: MealPlanResponse;
  takeaways: string[];
  nextActions: CoachAction[];
}

@Injectable({
  providedIn: 'root',
})
export class SmartScheduleService {
  constructor(private http: HttpClient) {}

  buildSchedule(profile: CoachProfile): Observable<ScheduleResponse> {
    return this.http.post<ScheduleResponse>(SCHEDULE_ENDPOINT, this.toPayload(profile));
  }

  fetchStoredSchedule(profile: CoachProfile): Observable<ScheduleResponse> {
    return this.http.post<ScheduleResponse>(`${SCHEDULE_ENDPOINT}/fetch`, this.toPayload(profile));
  }

  recordWellnessMetric(payload: WellnessMetricPayload): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(WELLNESS_ENDPOINT, payload);
  }

  fetchWellnessMetrics(limit = 10): Observable<WellnessMetricPayload[]> {
    return this.http.get<WellnessMetricPayload[]>(`${WELLNESS_ENDPOINT}?limit=${limit}`);
  }

  importWellnessMetrics(source: string, entries: WellnessMetricPayload[]): Observable<{ status: string; count: string }> {
    return this.http.post<{ status: string; count: string }>(WELLNESS_IMPORT_ENDPOINT, {
      source,
      entries,
    });
  }

  generateCoachRecommendation(
    profile: CoachProfile,
    mealPlanOverrides?: Partial<{ goal: string; diet: string; days: number; calories?: number | null }>
  ): Observable<CoachRecommendation> {
    return this.http.post<CoachRecommendation>(RECOMMENDATION_ENDPOINT, {
      schedule: this.toPayload(profile),
      mealPlan: mealPlanOverrides,
      focusAreas: [profile.stressLevel, profile.goal, profile.workStyle].filter(Boolean),
    });
  }

  private toPayload(profile: CoachProfile) {
    return {
      fullName: profile.fullName,
      occupation: profile.occupation,
      workStyle: profile.workStyle,
      timezone: profile.timezone,
      goal: profile.goal,
      preferredWindows: profile.preferredWindows,
      equipmentAccess: profile.equipmentAccess,
      dietPreference: profile.dietPreference,
      commuteMinutes: profile.commuteMinutes,
      stressLevel: profile.stressLevel,
      age: profile.age,
      gender: profile.gender,
      activityLevel: profile.activityLevel,
      injuries: profile.injuries,
      dietaryRestrictions: profile.dietaryRestrictions,
      dietaryAllergies: profile.dietaryAllergies,
      dietaryPreferences: profile.dietaryPreferences,
      supplements: profile.supplements,
      weightGoalShort: profile.weightGoalShort,
      weightGoalLong: profile.weightGoalLong,
    };
  }
}
