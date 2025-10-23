import { Component } from '@angular/core';

interface MobileNavLink {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-mobile-nav',
  templateUrl: './mobile-nav.component.html',
  styleUrls: ['./mobile-nav.component.css'],
})
export class MobileNavComponent {
  readonly links: MobileNavLink[] = [
    { label: 'Coach', icon: 'tips_and_updates', route: '/signed-in-landing-page' },
    { label: 'Meals', icon: 'restaurant', route: '/signed-in-landing-page' },
    { label: 'Profile', icon: 'person', route: '/coach-profile' },
    { label: 'Library', icon: 'fitness_center', route: '/exercise-list' },
  ];
}
