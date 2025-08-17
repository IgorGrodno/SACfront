import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Skill } from '../interfaces/skill.interface';
import { SkillStep } from '../interfaces/skillStep.interface';

const readonlyHttpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  withCredentials: true,
} as const;

@Injectable({
  providedIn: 'root',
})
export class SkillService {
  private readonly skillUrl = 'http://localhost:8080/api/skills';

  constructor(private readonly http: HttpClient) {}

  public getSkills(): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.skillUrl}`, readonlyHttpOptions);
  }

  public getUserSkills(id: number): Observable<Skill[]> {
    return this.http.get<Skill[]>(
      `${this.skillUrl}/user/${id}`,
      readonlyHttpOptions
    );
  }

  public getSkill(id: number): Observable<Skill> {
    return this.http.get<Skill>(`${this.skillUrl}/${id}`, readonlyHttpOptions);
  }

  public createSkill(skill: Skill): Observable<Skill> {
    return this.http.post<Skill>(
      `${this.skillUrl}`,
      skill,
      readonlyHttpOptions
    );
  }

  public updateSkill(id: number, skill: Skill): Observable<Skill> {
    return this.http.put<Skill>(
      `${this.skillUrl}/${id}`,
      skill,
      readonlyHttpOptions
    );
  }

  public deleteSkill(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.skillUrl}/${id}`,
      readonlyHttpOptions
    );
  }
}
