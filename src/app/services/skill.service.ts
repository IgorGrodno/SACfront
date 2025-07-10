import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SkillsPage } from '../interfaces/skillsPage.interface';
import { TestStep } from '../interfaces/testStep.interface';
import { map, Observable, tap } from 'rxjs';
import { Skill } from '../interfaces/skill.interface';
import as from '@angular/common/locales/as';
import { SkillTestResult } from '../interfaces/skillTestResult.interface';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  withCredentials: true,
};

@Injectable({
  providedIn: 'root',
})
export class SkillService {
  private skillUrl = 'fakeDB/SkillDB.json';

  constructor(private http: HttpClient) {}

  getSkill(skillId: number): Observable<Skill> {
    return this.http.get<{ skills: Skill[] }>(this.skillUrl).pipe(
      map((data) => {
        const skill = data.skills.find((s) => s.id === skillId);
        if (!skill) {
          throw new Error('Skill not found');
        }
        return skill;
      })
    );
  }

  getAllSkills(): Observable<Skill[]> {
    return this.http
      .get<{ skills: Skill[] }>(this.skillUrl)
      .pipe(map((data) => data.skills));
  }

  getSkillTestSteps(skillId: number): Observable<TestStep[]> {
    switch (skillId) {
      case 1: {
        return this.http
          .get<{ testSteps: TestStep[] }>('fakeDB/StepDB1.json')
          .pipe(map((data) => data.testSteps));
      }
      case 2: {
        return this.http
          .get<{ testSteps: TestStep[] }>('fakeDB/StepDB2.json')
          .pipe(map((data) => data.testSteps));
      }
      case 3: {
        return this.http
          .get<{ testSteps: TestStep[] }>('fakeDB/StepDB3.json')
          .pipe(map((data) => data.testSteps));
      }
      default: {
        return new Observable<TestStep[]>((observer) => {
          observer.next([]);
          observer.complete();
        });
      }
    }
  }

  sendTestResult(result: SkillTestResult): Observable<SkillTestResult> {
    return new Observable<SkillTestResult>((observer) => {
      observer.next(result);
      observer.complete();
    });
  }
}
