import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../data.service';
import { Exercise } from '../exercise';

@Component({
  selector: 'app-edit-exercise',
  templateUrl: './edit-exercise.component.html',
  styleUrls: ['./edit-exercise.component.css']
})
export class EditExerciseComponent implements OnInit {
  exercise = new Exercise();

  constructor(private data:DataService, private activatedRoute:ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.params[`id`];

    this.data.fetchExerciseById(id).subscribe(
      response => {
        this.exercise = response;
      }
    );

  }

  updateExerciseButton(id:number, exercise:Exercise){
    this.data.editExercise(id, exercise).subscribe(
      response=>{
        this.router.navigate(['exercise-list']);
      },
      error => console.log(error)
    );
}

}
