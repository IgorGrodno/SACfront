import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Discipline } from '../../interfaces/discipline.interface';
import { environment } from '../../../environments/environment';

const readonlyHttpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  withCredentials: true,
} as const;

@Injectable({
  providedIn: 'root',
})
export class DisciplineService {
  private readonly disciplineUrl = `${environment.apiUrl}/disciplines`;

  constructor(private readonly http: HttpClient) {}

  private url(id?: number): string {
    return id ? `${this.disciplineUrl}/${id}` : this.disciplineUrl;
  }

  public getDisciplines(): Observable<Discipline[]> {
    return this.http.get<Discipline[]>(this.url(), readonlyHttpOptions);
  }

  public getDiscipline(id: number): Observable<Discipline> {
    return this.http.get<Discipline>(this.url(id), readonlyHttpOptions);
  }

  public createDiscipline(discipline: Discipline): Observable<Discipline> {
    return this.http.post<Discipline>(
      this.url(),
      discipline,
      readonlyHttpOptions
    );
  }

  public updateDiscipline(
    id: number,
    discipline: Discipline
  ): Observable<Discipline> {
    return this.http.put<Discipline>(
      this.url(id),
      discipline,
      readonlyHttpOptions
    );
  }

  public deleteDiscipline(id: number): Observable<void> {
    return this.http.delete<void>(this.url(id), readonlyHttpOptions);
  }

  public getUserDisciplines(userId: number): Observable<Discipline[]> {
    return this.http.get<Discipline[]>(
      `${this.disciplineUrl}/user/${userId}`,
      readonlyHttpOptions
    );
  }
}
