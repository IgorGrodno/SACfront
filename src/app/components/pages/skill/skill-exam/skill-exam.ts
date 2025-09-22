import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SkillService } from '../../../../services/skill.service';
import { SessionService } from '../../../../services/session.service';
import { AuthService } from '../../../../services/auth.service';
import { ExamService } from '../../../../services/exam.service';
import { SkillTestResultsService } from '../../../../services/skill-test-results.service';

import { Skill } from '../../../../interfaces/skill.interface';
import { SkillStep } from '../../../../interfaces/skillStep.interface';
import { Session } from '../../../../interfaces/session.interface';

@Component({
  selector: 'app-skill-exam',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './skill-exam.html',
  styleUrls: ['./skill-exam.css'],
})
export class SkillExam implements OnInit, OnDestroy {
  skill?: Skill;
  skillSteps: SkillStep[] = [];
  stepScores: number[] = [];

  studentIds: number[] = [];
  filteredStudents: number[] = [];
  activeSessionList: Session[] = [];

  currentSessionId?: number;
  currentTeacherId?: number;
  currentStudentId?: number;

  score = 0;
  studentSearch = '';

  private subs: Subscription[] = [];

  constructor(
    private skillService: SkillService,
    private route: ActivatedRoute,
    private sessionService: SessionService,
    private authService: AuthService,
    private examService: ExamService,
    private skillTestResultsService: SkillTestResultsService
  ) {}

  ngOnInit(): void {
    const skillId = this.getSkillIdFromRoute();
    if (!skillId) return;

    this.loadSkill(skillId);
    this.loadSkillSteps(skillId);
    this.loadActiveSessions();
    this.subs.push(
      this.authService.currentUser$.subscribe(
        (user) => (this.currentTeacherId = user?.id)
      )
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }

  private getSkillIdFromRoute(): number | undefined {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    return !isNaN(id) ? id : undefined;
  }

  private loadSkill(skillId: number): void {
    const sub = this.skillService.getSkill(skillId).subscribe({
      next: (skill) => (this.skill = skill),
      error: (err) => console.error('Ошибка загрузки навыка:', err),
    });
    this.subs.push(sub);
  }

  private loadSkillSteps(skillId: number): void {
    const sub = this.skillService.getSkillSteps(skillId).subscribe({
      next: (steps) => {
        this.skillSteps = steps;
        this.stepScores = Array(steps.length).fill(0);
      },
      error: (err) => console.error('Ошибка загрузки шагов навыка:', err),
    });
    this.subs.push(sub);
  }

  private loadActiveSessions(): void {
    const sub = this.sessionService.getActiveSessions().subscribe({
      next: (sessions) => {
        this.activeSessionList = sessions;
        if (sessions.length === 1) {
          this.currentSessionId = sessions[0].id;
          this.loadStudents();
        }
      },
      error: (err) => console.error('Ошибка загрузки активных сессий:', err),
    });
    this.subs.push(sub);
  }

  onSessionChange(): void {
    this.currentStudentId = undefined;
    if (this.currentSessionId !== undefined) {
      this.loadStudents();
    } else {
      this.studentIds = [];
      this.filteredStudents = [];
    }
  }

  private loadStudents(): void {
    if (!this.currentSessionId) return;

    const sub = this.sessionService
      .getSessionById(this.currentSessionId)
      .subscribe({
        next: (session) => {
          this.studentIds = session.studentNumbers;
          this.loadSkillTestResults();
        },
        error: (err) => console.error('Ошибка загрузки сессии:', err),
      });
    this.subs.push(sub);
  }

  private loadSkillTestResults(): void {
    if (!this.currentSessionId) return;
    const sub = this.skillTestResultsService
      .getBySessionId(this.currentSessionId)
      .subscribe({
        next: (results) => {
          const passedStudents = results
            .filter((r) => r.skillId === this.skill?.id)
            .map((r) => r.studentId);
          this.filteredStudents = this.studentIds.filter(
            (id) => !passedStudents.includes(id)
          );
        },
        error: (err) =>
          console.error('Ошибка загрузки результатов экзаменов:', err),
      });
    this.subs.push(sub);
  }

  filterStudents(): void {
    const query = this.studentSearch.trim();
    this.filteredStudents = query
      ? this.studentIds.filter((id) => id.toString().includes(query))
      : [...this.studentIds];

    this.currentStudentId =
      this.filteredStudents.length === 1 ? this.filteredStudents[0] : undefined;
  }

  canSubmit(): boolean {
    return (
      this.currentSessionId !== undefined &&
      this.currentStudentId !== undefined &&
      this.stepScores.length === this.skillSteps.length
    );
  }

  submitExam(): void {
    if (!this.canSubmit()) {
      console.error('Форма заполнена некорректно');
      return;
    }

    const skillTestResult = {
      id: -1,
      sessionId: this.currentSessionId!,
      studentId: this.currentStudentId!,
      teacherId: this.currentTeacherId!,
      skillId: this.skill?.id ?? -1,
      stepScores: this.getStepScoresPayload(),
      resultDate: new Date().toISOString(),
    };

    const sub = this.examService.createResult(skillTestResult).subscribe({
      next: () => {
        alert('Результат экзамена успешно создан');
        this.resetForm();
        this.loadStudents();
      },
      error: (err) =>
        console.error('Ошибка при создании результата экзамена:', err),
    });
    this.subs.push(sub);
  }

  private getStepScoresPayload() {
    return this.skillSteps.map((step, i) => ({
      stepId: step.id,
      score: this.stepScores[i],
    }));
  }

  getStep(index: number): number {
    return this.clamp(this.stepScores[index] ?? 0, 0, 2);
  }

  setStep(index: number, value: number): void {
    this.stepScores[index] = this.clamp(value, 0, 2);
    this.score = this.calculateScore();
  }

  incStep(index: number): void {
    this.setStep(index, this.getStep(index) + 1);
  }
  decStep(index: number): void {
    this.setStep(index, this.getStep(index) - 1);
  }

  onStepKeyPress(event: KeyboardEvent): void {
    const allowed = [
      '0',
      '1',
      '2',
      'Backspace',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
    ];
    if (!allowed.includes(event.key)) event.preventDefault();
  }

  onStepBlur(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    this.setStep(index, ['0', '1', '2'].includes(value) ? Number(value) : 0);
    input.value = this.getStep(index).toString();
  }

  private calculateScore(): number {
    const max = this.skillSteps.length * 2;
    const total = this.stepScores.reduce((sum, score, i) => {
      const step = this.skillSteps[i];
      let s = score;
      if (s === 0 && step.mistakePossible) s -= 1;
      return sum + s;
    }, 0);
    return Math.round((Math.max(total, 0) / max) * 100);
  }

  private resetForm(): void {
    this.stepScores = Array(this.skillSteps.length).fill(0);
    this.currentStudentId = undefined;
    this.studentSearch = '';
    this.score = 0;
  }

  private clamp(value: number, min: number, max: number): number {
    const n = Number(value);
    return Math.max(min, Math.min(max, isNaN(n) ? min : n));
  }
}
