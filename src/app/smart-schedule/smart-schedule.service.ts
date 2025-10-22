import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CoachProfile } from '../coach-profile/coach-profile.service';

const SCHEDULE_ENDPOINT = 'http://localhost:8080/fit/schedule';
const WELLNESS_ENDPOINT = 'http://localhost:8080/fit/wellness-sync';
const WELLNESS_IMPORT_ENDPOINT = 'http://localhost:8080/fit/wellness-sync/import';

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
