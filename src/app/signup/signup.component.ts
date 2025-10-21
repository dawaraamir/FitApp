import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../data.service';
import { User } from '../user';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  user = new User();

  constructor(private data: DataService, private router:Router) { }

  ngOnInit(): void {
  }

  submitUserButton(): void {
    this.data.addUser(this.user).subscribe(
      (response: User) => {
        if (response && response.userId !== undefined && response.userId !== null) {
          this.router.navigate(['signed-in-landing-page', response.userId]);
        } else {
          this.router.navigate(['signed-in-landing-page']);
        }
      },
      error => console.error(error)
    );
  }

}
