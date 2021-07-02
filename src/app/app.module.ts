import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AddExerciseComponent } from './add-exercise/add-exercise.component';
import { EditExerciseComponent } from './edit-exercise/edit-exercise.component';
import { ExerciseListComponent } from './exercise-list/exercise-list.component';
import { ViewExerciseComponent } from './view-exercise/view-exercise.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { AboutPageComponent } from './about-page/about-page.component';
import { SearchfilterPipe } from './searchfilter.pipe';
import { SignupComponent } from './signup/signup.component';
import { SignedInLandingPageComponent } from './signed-in-landing-page/signed-in-landing-page.component';
import { ChartModule } from 'angular2-chartjs';
import { ChartComponent } from './chart/chart.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TaskComponent } from './task/task.component';

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
    TaskComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ChartModule,
    BrowserAnimationsModule,
    MatCardModule,
    DragDropModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
