import { Component, EventEmitter, Output } from '@angular/core';
import { CoachProfileService, QUICK_START_PRESETS } from '../coach-profile/coach-profile.service';

interface PresetCard {
  key: keyof typeof QUICK_START_PRESETS;
  title: string;
  subtitle: string;
  blurb: string;
}

@Component({
  selector: 'app-quick-start-presets',
  templateUrl: './quick-start-presets.component.html',
  styleUrls: ['./quick-start-presets.component.css'],
})
export class QuickStartPresetsComponent {
  @Output() presetApplied = new EventEmitter<void>();

  readonly presets: PresetCard[] = [
    {
      key: 'hybrid_hustle',
      title: 'Hybrid hustle',
      subtitle: 'Office + remote mix',
      blurb: 'Balanced strength and conditioning around morning commutes.',
    },
    {
      key: 'travel_reset',
      title: 'Travel reset',
      subtitle: 'Frequent flights',
      blurb: 'Bodyweight HIIT and mobility blocks for hotel weeks.',
    },
    {
      key: 'home_strength',
      title: 'Home strength',
      subtitle: 'Remote lifter',
      blurb: 'Progressive overload with garage gym access.',
    },
  ];

  constructor(private coachProfileService: CoachProfileService) {}

  applyPreset(key: keyof typeof QUICK_START_PRESETS): void {
    this.coachProfileService.applyPreset(key);
    this.presetApplied.emit();
  }
}
