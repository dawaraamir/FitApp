import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../data.service';
import { Exercise } from '../exercise';
import { User } from '../user';

@Component({
  selector: 'app-signed-in-landing-page',
  templateUrl: './signed-in-landing-page.component.html',
  styleUrls: ['./signed-in-landing-page.component.css']
})
export class SignedInLandingPageComponent implements OnInit {

  users!: User[];
  exercises!: Exercise[];
  user = new User();

  constructor(private datas:DataService, private router:Router, private activatedRoute:ActivatedRoute) {
     }

  ngOnInit(): void {
    this.getUserById();
    this.getAllExercises();

    const userId = this.activatedRoute.snapshot.params[`userId`];

    this.datas.fetchUserById(userId).subscribe(
      response => {
        this.user = response;
      }
    );
  }

  getUserById(){
    this.datas.fetchUser().subscribe(
      response => {
        this.users = response;
        console.log(this.users);
      }
    );
  }

  getAllExercises(){
    this.datas.fetchExercises().subscribe(
      response => {
        this.exercises = response;
        console.log(this.exercises);
      }
    );
  }

  saveExercise(userId:number, user:User){
    this.datas.editUser(userId, user).subscribe(
      response=>{
        this.router.navigate(['exercise-list']);
      },
      error => console.log(error)
    );
}

}
