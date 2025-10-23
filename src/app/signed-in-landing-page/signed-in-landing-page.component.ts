import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../data.service';
import { Exercise } from '../exercise';
import { User } from '../user';
import { CoachProfile, CoachProfileService } from '../coach-profile/coach-profile.service';
import {
  CoachRecommendation,
  CoachAction,
  SmartScheduleService,
  ScheduleResponse,
} from '../smart-schedule/smart-schedule.service';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-signed-in-landing-page',
  templateUrl: './signed-in-landing-page.component.html',
  styleUrls: ['./signed-in-landing-page.component.css']
})
export class SignedInLandingPageComponent implements OnInit {
  users: User[] = [];
  exercises: Exercise[] = [];
  user = new User();

  profile$ = this.coachProfileService.profile$;
  recommendation$: Observable<CoachRecommendation | null> = this.profile$.pipe(
    switchMap((profile) => {
      if (!profile) {
        return of(null);
      }
      return this.smartScheduleService
        .generateCoachRecommendation(profile, {
          goal: profile.goal,
          diet: profile.dietPreference,
          days: Math.min(Math.max(profile.preferredWindows?.length || 3, 3), 5),
          calories: profile.calorieTarget ?? null,
        })
        .pipe(
          catchError(() =>
            this.smartScheduleService.generateCoachRecommendation(profile, {
              goal: profile.goal,
              diet: profile.dietPreference,
              days: 3,
            })
          )
        );
    }),
    catchError(() => of(null))
  );

  private readonly windowLabelMap: Record<string, string> = {
    early_morning: 'early morning',
    pre_work: 'pre-work',
    midday: 'midday',
    late_afternoon: 'late afternoon',
    evening: 'evening',
    weekend: 'weekend flexibility',
  };

  private readonly equipmentLabelMap: Record<string, string> = {
    bodyweight: 'bodyweight',
    dumbbells: 'dumbbells',
    kettlebell: 'kettlebell',
    bands: 'resistance bands',
    full_gym: 'full gym',
    outdoors: 'outdoor / run',
  };

  constructor(
    private dataService: DataService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private coachProfileService: CoachProfileService,
    private smartScheduleService: SmartScheduleService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadExercises();
    this.loadUserFromRoute();
  }

  loadUsers(): void {
    this.dataService.fetchUser().subscribe({
      next: (response) => (this.users = response ?? []),
      error: (error) => console.error(error),
    });
  }

  loadExercises(): void {
    this.dataService.fetchExercises().subscribe({
      next: (response) => (this.exercises = response ?? []),
      error: (error) => console.error(error),
    });
  }

  saveExercise(userId: number, user: User): void {
    if (userId === undefined || userId === null) {
      return;
    }

    this.dataService.editUser(userId, user).subscribe({
      next: () => this.router.navigate(['exercise-list']),
      error: (error) => console.error(error),
    });
  }

  private loadUserFromRoute(): void {
    const param = this.activatedRoute.snapshot.paramMap.get('userId');
    if (!param) {
      return;
    }

    const userId = Number(param);
    if (Number.isNaN(userId)) {
      return;
    }

    this.dataService.fetchUserById(userId).subscribe({
      next: (response) => {
        this.user = response;
      },
      error: (error) => console.error(error),
    });
  }

  goalLabel(profile: CoachProfile | null): string {
    if (!profile) {
      return 'Stay consistent';
    }
    switch (profile.goal) {
      case 'fat_loss':
        return 'Fat loss momentum';
      case 'muscle_gain':
        return 'Lean muscle build';
      default:
        return 'Performance maintenance';
    }
  }

  firstName(profile: CoachProfile | null): string {
    if (!profile || !profile.fullName) {
      return 'there';
    }
    return profile.fullName.trim().split(' ')[0];
  }

  windowSummary(profile: CoachProfile | null): string {
    if (!profile || !profile.preferredWindows.length) {
      return 'We will propose openings based on your calendar sync.';
    }
    return profile.preferredWindows
      .map((value) => this.windowLabelMap[value] ?? value)
      .join(', ');
  }

  equipmentSummary(profile: CoachProfile | null): string {
    if (!profile || !profile.equipmentAccess.length) {
      return 'Bodyweight + mobility baseline.';
    }
    return profile.equipmentAccess.map((value) => this.equipmentLabelMap[value] ?? value).join(', ');
  }

  dietSummary(profile: CoachProfile | null): string {
    if (!profile) {
      return 'Adaptive meals';
    }
    return profile.dietPreference.replace('_', ' ');
  }

  scheduleFromRecommendation(recommendation: CoachRecommendation | null): ScheduleResponse | null {
    return recommendation?.schedule ?? null;
  }

  takeaways(recommendation: CoachRecommendation | null): string[] {
    return recommendation?.takeaways ?? [];
  }

  actions(recommendation: CoachRecommendation | null): CoachAction[] {
    return recommendation?.nextActions ?? [];
  }
}
