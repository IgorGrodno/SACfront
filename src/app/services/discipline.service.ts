import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Skill } from '../interfaces/skill.interface';
import { SkillStep } from '../interfaces/skillStep.interface';
import { Discipline } from '../interfaces/discipline.interface';

const readonlyHttpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  withCredentials: true,
} as const;

@Injectable({
  providedIn: 'root',
})
export class DisciplineService {
  private readonly skillUrl = 'http://localhost:8080/api/disciplines';

  constructor(private readonly http: HttpClient) {}

  public getDisciplines(): Observable<Discipline[]> {
    return this.http.get<Discipline[]>(`${this.skillUrl}`, readonlyHttpOptions);
  }

  public getDiscipline(id: number): Observable<Discipline> {
    return this.http.get<Discipline>(
      `${this.skillUrl}/${id}`,
      readonlyHttpOptions
    );
  }

  public createDiscipline(discipline: Discipline): Observable<Discipline> {
    return this.http.post<Discipline>(
      `${this.skillUrl}`,
      discipline,
      readonlyHttpOptions
    );
  }

  public updateDiscipline(
    id: number,
    discipline: Discipline
  ): Observable<Discipline> {
    return this.http.put<Discipline>(
      `${this.skillUrl}/${id}`,
      discipline,
      readonlyHttpOptions
    );
  }

  public deleteDiscipline(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.skillUrl}/${id}`,
      readonlyHttpOptions
    );
  }

  public getUserDisciplines(id: number): Observable<Discipline[]> {
    return this.http.get<Discipline[]>(
      `${this.skillUrl}/user/${id}`,
      readonlyHttpOptions
    );
  }
}
