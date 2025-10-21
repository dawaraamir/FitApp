import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutPageComponent } from './about-page/about-page.component';
import { AddExerciseComponent } from './add-exercise/add-exercise.component';
import { ChartComponent } from './chart/chart.component';
import { EditExerciseComponent } from './edit-exercise/edit-exercise.component';
import { ExerciseListComponent } from './exercise-list/exercise-list.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { SignedInLandingPageComponent } from './signed-in-landing-page/signed-in-landing-page.component';
import { SignupComponent } from './signup/signup.component';
import { TaskComponent } from './task/task.component';
import { ViewExerciseComponent } from './view-exercise/view-exercise.component';

const routes: Routes = [
  { path: '', redirectTo: 'landing-page', pathMatch: 'full' },
  { path: 'landing-page', component: LandingPageComponent },
  { path: 'about-page', component: AboutPageComponent },
  { path: 'exercise-list', component: ExerciseListComponent },
  { path: 'add-exercise', component: AddExerciseComponent },
  { path: 'view-exercise/:id', component: ViewExerciseComponent },
  { path: 'edit-exercise/:id', component: EditExerciseComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'signed-in-landing-page/:userId', component: SignedInLandingPageComponent },
  { path: 'signed-in-landing-page', component: SignedInLandingPageComponent },
  { path: 'chart', component: ChartComponent },
  { path: 'task', component: TaskComponent },
  { path: '**', redirectTo: 'landing-page', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
