import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Exercise } from './exercise';
import { User } from './user';
import { environment } from '../environments/environment';

const API_BASE = environment.apiBaseUrl;

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private http: HttpClient) {}

  fetchExercises(): Observable<Exercise[]> {
    return this.http.get<Exercise[]>(`${API_BASE}/exercise`);
  }

  addExercise(exercise: Exercise): Observable<Exercise> {
    return this.http.post<Exercise>(`${API_BASE}/exercise`, exercise);
  }

  fetchExerciseById(id: number): Observable<Exercise> {
    return this.http.get<Exercise>(`${API_BASE}/exercise/${id}`);
  }

  deleteExercise(id: number): Observable<{ status: string }> {
    return this.http.delete<{ status: string }>(`${API_BASE}/exercise/${id}`);
  }

  editExercise(id: number, exercise: Exercise): Observable<Exercise> {
    return this.http.put<Exercise>(`${API_BASE}/exercise/${id}`, exercise);
  }

  fetchUser(): Observable<User[]> {
    return this.http.get<User[]>(`${API_BASE}/user`);
  }

  addUser(user: User): Observable<User> {
    return this.http.post<User>(`${API_BASE}/user`, user);
  }

  fetchUserById(userId: number): Observable<User> {
    return this.http.get<User>(`${API_BASE}/user/${userId}`);
  }

  deleteUser(userId: number): Observable<{ status: string }> {
    return this.http.delete<{ status: string }>(`${API_BASE}/user/${userId}`);
  }

  editUser(userId: number, user: User): Observable<User> {
    return this.http.put<User>(`${API_BASE}/user/${userId}`, user);
  }
}
