import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../data.service';
import { Exercise } from '../exercise';

@Component({
  selector: 'app-exercise-list',
  templateUrl: './exercise-list.component.html',
  styleUrls: ['./exercise-list.component.css']
})
export class ExerciseListComponent implements OnInit {

  exercises!: Exercise[];
  searchValue!: string;

  constructor(private data:DataService, private router:Router) { }

  ngOnInit(): void {
    this.getAllExercises();
  }

  getAllExercises(){
    this.data.fetchExercises().subscribe(
      response => {
        this.exercises = response;
        console.log(this.exercises);
      }
    );
  }

  addExerciseButton(){
    // route them to the addExercise component
    this.router.navigate(['add-exercise']);
  }

  viewExercise(id: number){
    this.router.navigate(['view-exercise', id]); // view-Exercise/:id
  }

  deleteExercise(id: number){
    this.data.deleteExercise(id).subscribe(
      //refresh the page or navigate
      response =>{
        this.getAllExercises();
      }

    );
  }

  editExercise(id:number){
    this.router.navigate(['edit-exercise', id]);
  }


}
