import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { SmartScheduleService, WellnessMetricPayload } from '../smart-schedule/smart-schedule.service';

interface ImportOption {
  label: string;
  source: string;
  entries: WellnessMetricPayload[];
}

@Component({
  selector: 'app-wellness-sync',
  templateUrl: './wellness-sync.component.html',
  styleUrls: ['./wellness-sync.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WellnessSyncComponent {
  form: FormGroup;
  submitting = false;
  feedback = '';
  history: WellnessMetricPayload[] = [];
  
  readonly energyOptions = ['low', 'steady', 'charged'];
  readonly importOptions: ImportOption[] = [
    {
      label: 'Apple Health sample',
      source: 'apple_health',
      entries: [
        { timestamp: new Date().toISOString(), steps: 9200, sleepHours: 7.6, readiness: 82, energyLevel: 'steady', comment: 'Office day, light walk at lunch.' },
        { timestamp: new Date(Date.now() - 86400000).toISOString(), steps: 11400, sleepHours: 8.1, readiness: 88, energyLevel: 'charged' },
      ] as WellnessMetricPayload[],
    },
    {
      label: 'Fitbit sample',
      source: 'fitbit',
      entries: [
        { timestamp: new Date().toISOString(), steps: 5400, sleepHours: 5.5, readiness: 58, energyLevel: 'low', comment: 'Red-eye flight, need recovery.' },
        { timestamp: new Date(Date.now() - 86400000).toISOString(), steps: 7800, sleepHours: 6.2, readiness: 64 },
      ] as WellnessMetricPayload[],
    },
    {
      label: 'Whoop sample',
      source: 'whoop',
      entries: [
        { timestamp: new Date().toISOString(), readiness: 72, energyLevel: 'steady', comment: 'Moderate strain day.' },
      ] as WellnessMetricPayload[],
    },
  ];

  constructor(private fb: FormBuilder, private smartScheduleService: SmartScheduleService) {
    this.form = this.fb.group({
      steps: [null, [Validators.min(0)]],
      sleepHours: [null, [Validators.min(0), Validators.max(24)]],
      readiness: [null, [Validators.min(0), Validators.max(100)]],
      energyLevel: ['steady'],
      comment: [''],
    });
    this.refreshHistory();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const now = new Date().toISOString();
    const payload: WellnessMetricPayload = {
      timestamp: now,
      source: 'manual',
      steps: this.toNumber(this.form.value.steps),
      sleepHours: this.toNumber(this.form.value.sleepHours),
      readiness: this.toNumber(this.form.value.readiness),
      energyLevel: this.form.value.energyLevel,
      comment: this.form.value.comment,
    };

    this.submitting = true;
    this.feedback = '';
    this.smartScheduleService
      .recordWellnessMetric(payload)
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: () => {
          this.feedback = 'Synced!';
          this.form.reset({ energyLevel: 'steady' });
          this.refreshHistory();
        },
        error: () => {
          this.feedback = 'Something went wrong. Please try again.';
        },
      });
  }

  private refreshHistory(): void {
    this.smartScheduleService.fetchWellnessMetrics().subscribe({
      next: (metrics) => (this.history = metrics.slice().reverse()),
      error: () => (this.history = []),
    });
  }

  importSample(option: ImportOption): void {
    this.submitting = true;
    this.smartScheduleService
      .importWellnessMetrics(option.source, option.entries)
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: () => {
          this.feedback = `${option.label} synced`;
          this.refreshHistory();
        },
        error: () => (this.feedback = 'Could not import sample data.'),
      });
  }

  private toNumber(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
}
