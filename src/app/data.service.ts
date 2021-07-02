import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Exercise } from './exercise';
import { User } from './user';
@Injectable({
  providedIn: 'root'
})
export class DataService {


  constructor(private http:HttpClient) { }


  //Get all
  fetchExercises(): Observable<Exercise[]>{
    return this.http.get<Exercise[]>(`http://localhost:8080/fit/exercise`);
  }

  //POST
  addExercise(exercise:Exercise){
      return this.http.post<Exercise>(`http://localhost:8080/fit/exercise`, exercise);
  }

  //Get Exercise By ID

  fetchExerciseById(id: number):Observable<Exercise>{
    return this.http.get<Exercise>(`http://localhost:8080/fit/exercise/${id}`);
  }

  //Delete an Exercise by ID
  deleteExercise(id: number):Observable<any>{
    return this.http.delete<any>(`http://localhost:8080/fit/exercise/${id}`);
  }

  editExercise(id:number, exercise: Exercise):Observable<Exercise>{
      return this.http.put<Exercise>(`http://localhost:8080/fit/exercise/${id}`, exercise);
  }

 //Get all
 fetchUser(): Observable<User[]>{
  return this.http.get<User[]>(`http://localhost:8080/fit/user`);
}

//POST
addUser(user:User){
    return this.http.post<User>(`http://localhost:8080/fit/user`, user);
}

//Get user By ID

fetchUserById(userId: number):Observable<User>{
  return this.http.get<User>(`http://localhost:8080/fit/user/${userId}`);
}

//Delete a user by ID
deleteUser(userId: number):Observable<any>{
  return this.http.delete<any>(`http://localhost:8080/fit/user/${userId}`);
}

editUser(userId:number, user: User):Observable<User>{
    return this.http.put<User>(`http://localhost:8080/fit/user/${userId}`, user);
}

}
