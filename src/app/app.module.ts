import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AddExerciseComponent } from './add-exercise/add-exercise.component';
import { EditExerciseComponent } from './edit-exercise/edit-exercise.component';
import { ExerciseListComponent } from './exercise-list/exercise-list.component';
import { ViewExerciseComponent } from './view-exercise/view-exercise.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { AboutPageComponent } from './about-page/about-page.component';
import { SearchfilterPipe } from './searchfilter.pipe';
import { SignupComponent } from './signup/signup.component';
import { SignedInLandingPageComponent } from './signed-in-landing-page/signed-in-landing-page.component';
import { ChartComponent } from './chart/chart.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatStepperModule } from '@angular/material/stepper';
import { TaskComponent } from './task/task.component';
import { MealPlanGeneratorComponent } from './meal-plan/meal-plan-generator.component';
import { CoachProfileComponent } from './coach-profile/coach-profile.component';
import { WellnessSyncComponent } from './wellness-sync/wellness-sync.component';
import { QuickStartPresetsComponent } from './quick-start-presets/quick-start-presets.component';
import { ProfileOnboardingComponent } from './coach-profile/profile-onboarding.component';
import { MobileNavComponent } from './mobile-nav/mobile-nav.component';

@NgModule({
  declarations: [
    AppComponent,
    AddExerciseComponent,
    EditExerciseComponent,
    ExerciseListComponent,
    ViewExerciseComponent,
    HeaderComponent,
    FooterComponent,
    LandingPageComponent,
    AboutPageComponent,
    SearchfilterPipe,
    SignupComponent,
    SignedInLandingPageComponent,
    ChartComponent,
    TaskComponent,
    MealPlanGeneratorComponent,
    CoachProfileComponent,
    WellnessSyncComponent,
    QuickStartPresetsComponent,
    ProfileOnboardingComponent,
    MobileNavComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatDividerModule,
    MatListModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatStepperModule,
    DragDropModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
