import { Component, OnDestroy, OnInit } from '@angular/core';
import { SkillService } from '../../../../services/skill.service';
import { SkillStep } from '../../../../interfaces/skillStep.interface';
import { ActivatedRoute } from '@angular/router';
import { SessionService } from '../../../../services/session.service';
import { AuthService } from '../../../../services/auth.service';
import { Session } from '../../../../interfaces/session.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExamService } from '../../../../services/exam.service';
import { Skill } from '../../../../interfaces/skill.interface';
import { Subscription } from 'rxjs';
import { SkillTestResultsService } from '../../../../services/skill-test-results.service';

@Component({
  selector: 'app-skill-exam',
  imports: [CommonModule, FormsModule],
  templateUrl: './skill-exam.html',
  styleUrls: ['./skill-exam.css'],
})
export class SkillExam implements OnInit, OnDestroy {
  skillSteps: SkillStep[] = [];
  stepScores: number[] = [];

  studentIds: number[] = [];
  filteredStudents: number[] = [];
  activeSessionList: Session[] = [];

  currentSessionId?: number;
  currentTeacherId?: number;
  currentStudentId?: number;

  skill?: Skill;
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

    this.loadSkillSteps(skillId);
    this.loadSkill(skillId);
    this.loadActiveSessions();
    this.subs.push(
      this.authService.currentUser$.subscribe(
        (user) => (this.currentTeacherId = user?.id)
      )
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  private getSkillIdFromRoute(): number | undefined {
    const skillIdParam = this.route.snapshot.paramMap.get('id');
    const skillId = skillIdParam ? Number(skillIdParam) : undefined;
    return !isNaN(skillId!) ? skillId : undefined;
  }

  private loadSkillSteps(skillId: number): void {
    const s = this.skillService.getSkillSteps(skillId).subscribe({
      next: (steps) => {
        this.skillSteps = steps;
        this.stepScores = Array(steps.length).fill(0);
      },
      error: (err) => console.error('Ошибка загрузки шагов навыка:', err),
    });
    this.subs.push(s);
  }

  private loadSkill(skillId: number): void {
    const s = this.skillService.getSkill(skillId).subscribe({
      next: (skill) => (this.skill = skill),
      error: (err) => console.error('Ошибка загрузки навыка:', err),
    });
    this.subs.push(s);
  }

  private loadActiveSessions(): void {
    const s = this.sessionService.getActiveSessions().subscribe({
      next: (sessions) => {
        this.activeSessionList = sessions;
        if (sessions.length === 1) {
          this.currentSessionId = sessions[0].id;
          this.loadStudents();
        }
      },
      error: (err) => console.error('Ошибка загрузки активных сессий:', err),
    });
    this.subs.push(s);
  }

  onSessionChange(): void {
    if (this.currentSessionId !== undefined) {
      this.loadStudents();
    } else {
      this.studentIds = [];
      this.filteredStudents = [];
    }
    this.currentStudentId = undefined;
  }

  private loadStudents(): void {
    if (!this.currentSessionId) return;

    const s = this.sessionService
      .getSessionById(this.currentSessionId)
      .subscribe({
        next: (session) => {
          this.studentIds = session.studentNumbers;

          // загружаем результаты экзаменов по выбранной сессии
          const examSub = this.skillTestResultsService
            .getBySessionId(this.currentSessionId!)
            .subscribe({
              next: (results) => {
                // выбираем только те результаты, которые относятся к текущему навыку
                const passedStudents = results
                  .filter((r) => r.skillId === this.skill?.id)
                  .map((r) => r.studentId);

                // исключаем студентов, которые уже сдавали
                this.filteredStudents = this.studentIds.filter(
                  (id) => !passedStudents.includes(id)
                );
              },
              error: (err) =>
                console.error('Ошибка загрузки результатов экзаменов:', err),
            });

          this.subs.push(examSub);
        },
        error: (err) => console.error('Ошибка загрузки сессии:', err),
      });

    this.subs.push(s);
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

  private setStepScoresPayload() {
    return this.skillSteps.map((step, index) => ({
      stepId: step.id,
      score: this.stepScores[index],
    }));
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
      stepScores: this.setStepScoresPayload(),
      resultDate: new Date().toISOString(),
    };

    const s = this.examService.createResult(skillTestResult).subscribe({
      next: () => {
        alert('Результат экзамена успешно создан');
        this.resetForm();
        this.loadStudents(); // <-- переносим сюда, после resetForm
      },
      error: (err) =>
        console.error('Ошибка при создании результата экзамена:', err),
    });
    this.subs.push(s);
  }

  getStep(i: number): number {
    return this.clamp(this.stepScores[i] ?? 0, 0, 2);
  }

  setStep(i: number, val: number): void {
    this.stepScores[i] = this.clamp(val, 0, 2);
    this.score = this.calculateScore();
  }

  incStep(i: number): void {
    this.setStep(i, this.getStep(i) + 1);
  }

  decStep(i: number): void {
    this.setStep(i, this.getStep(i) - 1);
  }

  onStepInput(i: number, val: string): void {
    this.setStep(i, Number(val));
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
    const maxPossible = this.skillSteps.length * 2;
    const total = this.stepScores.reduce((sum, score, i) => {
      const step = this.skillSteps[i];
      let s = score;
      if (s === 0 && step.mistakePossible) s -= 1;
      return sum + s;
    }, 0);

    return Math.round((Math.max(total, 0) / maxPossible) * 100);
  }

  private resetForm(): void {
    this.stepScores = Array(this.skillSteps.length).fill(0);
    this.currentStudentId = undefined;
    this.studentSearch = '';
    this.score = 0;
  }

  private clamp(n: number, min: number, max: number): number {
    const v = Number(n);
    return Math.max(min, Math.min(max, isNaN(v) ? min : v));
  }
}
