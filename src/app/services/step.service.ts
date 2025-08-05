import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SkillStep } from '../interfaces/skillStep.interface';

const readonlyHttpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  withCredentials: true,
} as const;

@Injectable({
  providedIn: 'root',
})
export class StepService {
  private readonly skillUrl = 'http://localhost:8080/api/steps';

  constructor(private readonly http: HttpClient) {}

  public getAllSteps(): Observable<SkillStep[]> {
    return this.http.get<SkillStep[]>(`${this.skillUrl}`, readonlyHttpOptions);
  }

  public addStep(step: SkillStep): Observable<SkillStep> {
    return this.http.post<SkillStep>(
      `${this.skillUrl}`,
      step,
      readonlyHttpOptions
    );
  }

  public removeStep(stepId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.skillUrl}/${stepId}`,
      readonlyHttpOptions
    );
  }
}
