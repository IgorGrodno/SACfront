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

  // ====== Skills ======
  getSkills(): Observable<Skill[]> {
    return this.http.get<Skill[]>(this.skillUrl, readonlyHttpOptions);
  }

  getDisciplineSkills(id: number): Observable<Skill[]> {
    return this.http.get<Skill[]>(
      `${this.skillUrl}/discipline/${id}`,
      readonlyHttpOptions
    );
  }

  getSkill(id: number): Observable<Skill> {
    return this.http.get<Skill>(`${this.skillUrl}/${id}`, readonlyHttpOptions);
  }

  createSkill(skill: Omit<Skill, 'id'>): Observable<Skill> {
    return this.http.post<Skill>(this.skillUrl, skill, readonlyHttpOptions);
  }

  updateSkill(id: number, skill: Partial<Skill>): Observable<Skill> {
    return this.http.put<Skill>(
      `${this.skillUrl}/${id}`,
      skill,
      readonlyHttpOptions
    );
  }

  deleteSkill(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.skillUrl}/${id}`,
      readonlyHttpOptions
    );
  }

  // ====== Skill Steps ======
  getSkillSteps(skillId: number): Observable<SkillStep[]> {
    return this.http.get<SkillStep[]>(
      `${this.skillUrl}/steps/${skillId}`,
      readonlyHttpOptions
    );
  }

  createSkillStep(
    skillId: number,
    step: Omit<SkillStep, 'id'>
  ): Observable<SkillStep> {
    return this.http.post<SkillStep>(
      `${this.skillUrl}/${skillId}/steps`,
      step,
      readonlyHttpOptions
    );
  }

  updateSkillStep(
    skillId: number,
    stepId: number,
    step: Partial<SkillStep>
  ): Observable<SkillStep> {
    return this.http.put<SkillStep>(
      `${this.skillUrl}/${skillId}/steps/${stepId}`,
      step,
      readonlyHttpOptions
    );
  }

  deleteSkillStep(
    skillId: number,
    stepId: number
  ): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.skillUrl}/${skillId}/steps/${stepId}`,
      readonlyHttpOptions
    );
  }
}
