import { Component, OnInit } from '@angular/core';
import { Data, Router } from '@angular/router';
import { DataService } from '../data.service';
import { Exercise } from '../exercise';

@Component({
  selector: 'app-add-exercise',
  templateUrl: './add-exercise.component.html',
  styleUrls: ['./add-exercise.component.css']
})
export class AddExerciseComponent implements OnInit {

  exercise = new Exercise();

  constructor(private data: DataService, private router:Router) { }

  ngOnInit(): void {
  }

  submitExerciseButton(){
    this.data.addExercise(this.exercise).subscribe(
      response =>{
        this.router.navigate(['exercise-list']);
      }
    )
  }

}
