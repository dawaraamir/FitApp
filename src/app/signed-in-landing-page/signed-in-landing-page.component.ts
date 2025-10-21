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
    this.loadUsers();
    this.getAllExercises();
    this.loadUserFromRoute();
  }

  loadUsers(): void {
    this.datas.fetchUser().subscribe(
      response => {
        this.users = response;
        console.log(this.users);
      },
      error => console.error(error)
    );
  }

  getAllExercises(): void {
    this.datas.fetchExercises().subscribe(
      response => {
        this.exercises = response;
        console.log(this.exercises);
      },
      error => console.error(error)
    );
  }

  saveExercise(userId:number, user:User): void {
    if (userId === undefined || userId === null) {
      return;
    }

    this.datas.editUser(userId, user).subscribe(
      response=>{
        this.router.navigate(['exercise-list']);
      },
      error => console.error(error)
    );
}

  private loadUserFromRoute(): void {
    const param = this.activatedRoute.snapshot.paramMap.get('userId');
    if (!param) {
      return;
    }

    const userId = Number(param);
    if (Number.isNaN(userId)) {
      return;
    }

    this.datas.fetchUserById(userId).subscribe(
      response => {
        this.user = response;
      },
      error => console.error(error)
    );
  }

}
