import { Component, Input } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CoachProfile, CoachProfileService } from '../coach-profile/coach-profile.service';
import { ScheduledSession } from '../smart-schedule/smart-schedule.service';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent {
  @Input() recommendedSessions: ScheduledSession[] | null = null;
  @Input() scheduleSummary = '';

  exercises = [
    'Lat Pulldown',
    'Dumbbell Bench Press',
    'Shoulder Shrug',
    'Bicep Curls',
    'Tricep Pulls',
    'Russian Twist',
    'Squats'
  ];

  sunday: string[] = [];
  monday: string[] = [];
  tuesday: string[] = [];
  wednesday: string[] = [];
  thursday: string[] = [];
  friday: string[] = [];
  saturday: string[] = [];
  profile$ = this.coachProfileService.profile$;

  constructor(private coachProfileService: CoachProfileService) {}

  resetWeek(): void {
    this.sunday = [];
    this.monday = [];
    this.tuesday = [];
    this.wednesday = [];
    this.thursday = [];
    this.friday = [];
    this.saturday = [];
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
    }
  }

  focusSummary(profile: CoachProfile | null): string {
    if (!profile) {
      return 'Drag movements into the days that fit. The coach will adapt once you save your profile.';
    }

    const base =
      profile.goal === 'fat_loss'
        ? 'Alternate metabolic circuits with strength maintenance sets.'
        : profile.goal === 'muscle_gain'
        ? 'Prioritise progressive overload with push/pull/legs waves.'
        : 'Blend strength upkeep with mobility to stay competition ready.';

    const equipmentHint = profile.equipmentAccess.length
      ? `We will lean on ${profile.equipmentAccess.join(', ')}`
      : 'We will anchor bodyweight and mobility-heavy sessions';

    return `${base} ${equipmentHint.toLowerCase()} and protect your preferred windows so nothing slips.`;
  }

  applyRecommendedPlan(): void {
    if (!this.recommendedSessions || !this.recommendedSessions.length) {
      return;
    }

    this.resetWeek();
    for (const session of this.recommendedSessions) {
      const label = `${session.focus} (${session.durationMinutes}m, ${session.intensity})`;
      const dayKey = session.day.toLowerCase();
      switch (dayKey) {
        case 'monday':
          this.monday.push(label);
          break;
        case 'tuesday':
          this.tuesday.push(label);
          break;
        case 'wednesday':
          this.wednesday.push(label);
          break;
        case 'thursday':
          this.thursday.push(label);
          break;
        case 'friday':
          this.friday.push(label);
          break;
        case 'saturday':
          this.saturday.push(label);
          break;
        case 'sunday':
          this.sunday.push(label);
          break;
        default:
          this.monday.push(label);
      }
    }
  }
}
