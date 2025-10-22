import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../data.service';
import { Exercise } from '../exercise';

@Component({
  selector: 'app-exercise-list',
  templateUrl: './exercise-list.component.html',
  styleUrls: ['./exercise-list.component.css'],
})
export class ExerciseListComponent implements OnInit {
  exercises: Exercise[] = [];
  filteredExercises: Exercise[] = [];
  searchTerm = '';
  selectedCategory = 'all';

  readonly categories = [
    { label: 'All', value: 'all' },
    { label: 'Chest', value: 'Chest' },
    { label: 'Back', value: 'Back' },
    { label: 'Biceps', value: 'Biceps' },
    { label: 'Triceps', value: 'Triceps' },
    { label: 'Shoulders', value: 'Shoulders' },
    { label: 'Legs', value: 'Legs' },
    { label: 'Abs', value: 'Abs' },
  ];

  constructor(private data: DataService, private router: Router) {}

  ngOnInit(): void {
    this.loadExercises();
  }

  loadExercises(): void {
    this.data.fetchExercises().subscribe((response) => {
      this.exercises = response ?? [];
      this.applyFilters();
    });
  }

  addExerciseButton(): void {
    this.router.navigate(['add-exercise']);
  }

  viewExercise(id: number): void {
    this.router.navigate(['view-exercise', id]);
  }

  editExercise(id: number): void {
    this.router.navigate(['edit-exercise', id]);
  }

  deleteExercise(id: number): void {
    this.data.deleteExercise(id).subscribe(() => {
      this.loadExercises();
    });
  }

  selectCategory(value: string): void {
    this.selectedCategory = value;
    this.applyFilters();
  }

  updateSearchTerm(value: string): void {
    this.searchTerm = value;
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedCategory = 'all';
    this.searchTerm = '';
    this.applyFilters();
  }

  private applyFilters(): void {
    const normalizedSearch = this.searchTerm.trim().toLowerCase();
    this.filteredExercises = this.exercises.filter((exercise) => {
      const matchesCategory =
        this.selectedCategory === 'all' ||
        exercise.category.toLowerCase() === this.selectedCategory.toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        exercise.exerciseName.toLowerCase().includes(normalizedSearch) ||
        exercise.description.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }
}
