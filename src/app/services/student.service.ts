import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Skill } from '../interfaces/skill.interface';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  withCredentials: true,
};

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  constructor(private http: HttpClient) {}

  getStudentNumbers(): Observable<number[]> {
    const numbers = Array.from({ length: 1000 }, (_, i) => i + 1);
    return new Observable<number[]>((observer) => {
      observer.next(numbers);
      observer.complete();
    });
  }
}
