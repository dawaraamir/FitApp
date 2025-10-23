import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MealPlanRequest, MealPlanResponse } from './meal-plan.model';
import { environment } from '../../environments/environment';

const MEAL_PLAN_ENDPOINT = `${environment.apiBaseUrl}/meal-plan`;

@Injectable({
  providedIn: 'root',
})
export class MealPlanService {
  constructor(private http: HttpClient) {}

  getSamplePlan(): Observable<MealPlanResponse> {
    return this.http.get<MealPlanResponse>(MEAL_PLAN_ENDPOINT);
  }

  generatePlan(payload: MealPlanRequest): Observable<MealPlanResponse> {
    return this.http.post<MealPlanResponse>(MEAL_PLAN_ENDPOINT, payload);
  }
}
