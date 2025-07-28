import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Skill } from '../interfaces/skill.interface';
import { SkillTestResult } from '../interfaces/skillTestResult.interface';
import { SkillStep } from '../interfaces/skillStep.interface';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  withCredentials: true,
};

@Injectable({
  providedIn: 'root',
})
export class SkillService {
  private skillUrl = 'http://localhost:8080/api/skills';

  constructor(private http: HttpClient) {}

  getAllSkills(): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.skillUrl}/skills`, httpOptions);
  }

  sendTestResult(result: SkillTestResult): Observable<SkillTestResult> {
    return this.http.post<SkillTestResult>(
      `${this.skillUrl}/test-result`,
      result,
      httpOptions
    );
  }

  getSkill(id: number): Observable<Skill> {
    return this.http.get<Skill>(`${this.skillUrl}/skill/${id}`);
  }

  getSkillSteps(): Observable<SkillStep[]> {
    return this.http.get<SkillStep[]>(`${this.skillUrl}/steps`, httpOptions);
  }

  createSkill(skill: Skill): Observable<any> {
    return this.http.post(`${this.skillUrl}/skill`, skill);
  }

  updateSkill(id: number, skill: Skill): Observable<any> {
    return this.http.put(`${this.skillUrl}/skill/${id}`, skill);
  }

  addStep(step: SkillStep): Observable<SkillStep> {
    console.log('Adding step:', step);
    return this.http.post<SkillStep>(
      `${this.skillUrl}/steps`,
      step,
      httpOptions
    );
  }

  removeStep(stepId: number): Observable<any> {
    return this.http.delete(`${this.skillUrl}/step/${stepId}`, httpOptions);
  }
}
