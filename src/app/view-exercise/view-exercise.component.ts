import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../data.service';
import { Exercise } from '../exercise';

@Component({
  selector: 'app-view-exercise',
  templateUrl: './view-exercise.component.html',
  styleUrls: ['./view-exercise.component.css']
})
export class ViewExerciseComponent implements OnInit {

  exercise = new Exercise();

  constructor(private data:DataService, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.params[`id`];
    this.data.fetchExerciseById(id).subscribe(
      response =>{
          this.exercise = response;
      },
      error => console.log(error)
    );
  }

}
