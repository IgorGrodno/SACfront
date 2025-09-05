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
  private readonly stepUrl = 'http://localhost:8080/api/steps';

  constructor(private readonly http: HttpClient) {}

  // ===== Все шаги =====
  getAllSteps(): Observable<SkillStep[]> {
    return this.http.get<SkillStep[]>(this.stepUrl, readonlyHttpOptions);
  }

  // ===== Получить шаг по ID =====
  getStepById(stepId: number): Observable<SkillStep> {
    return this.http.get<SkillStep>(
      `${this.stepUrl}/${stepId}`,
      readonlyHttpOptions
    );
  }

  // ===== Добавить шаг =====
  addStep(step: Omit<SkillStep, 'id'>): Observable<SkillStep> {
    return this.http.post<SkillStep>(this.stepUrl, step, readonlyHttpOptions);
  }

  // ===== Обновить шаг =====
  updateStep(stepId: number, step: Partial<SkillStep>): Observable<SkillStep> {
    return this.http.put<SkillStep>(
      `${this.stepUrl}/${stepId}`,
      step,
      readonlyHttpOptions
    );
  }

  // ===== Удалить шаг =====
  removeStep(stepId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.stepUrl}/${stepId}`,
      readonlyHttpOptions
    );
  }
}
