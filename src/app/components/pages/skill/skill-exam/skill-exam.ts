import { Component } from '@angular/core';
import { SkillService } from '../../../../services/skill.service';
import { SkillStep } from '../../../../interfaces/skillStep.interface';
import { ActivatedRoute } from '@angular/router';
import { SessionService } from '../../../../services/session.service';
import { AuthService } from '../../../../services/auth.service';
import { Session } from '../../../../interfaces/session.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExamService } from '../../../../services/exam.service';

@Component({
  selector: 'app-skill-exam',
  imports: [CommonModule, FormsModule],
  templateUrl: './skill-exam.html',
  styleUrls: ['./skill-exam.css'],
})
export class SkillExam {
  skillSteps: SkillStep[] = [];
  studentIds: number[] = [];
  activeSessionList: Session[] = [];

  currentSessionId: number | undefined;
  currentTeacherId: number | undefined;
  currentStudentId: number | undefined;

  skillId!: number | undefined;

  stepScores: number[] = [];
  grossErrors: number = 0;
  minorErrors: number = 0;
  Math: any;

  constructor(
    private skillService: SkillService,
    private route: ActivatedRoute,
    private sessionService: SessionService,
    private authService: AuthService,
    private examService: ExamService
  ) {}

  ngOnInit(): void {
    const skillIdParam = this.route.snapshot.paramMap.get('id');
    this.skillId = skillIdParam !== null ? Number(skillIdParam) : undefined;

    if (typeof this.skillId === 'number' && !isNaN(this.skillId)) {
      this.skillService.getSkillSteps(this.skillId).subscribe({
        next: (steps) => {
          this.skillSteps = steps;
          this.stepScores = new Array(steps.length).fill(0);

          this.sessionService.getActiveSessions().subscribe({
            next: (session) => {
              this.activeSessionList = session;
              if (this.activeSessionList.length === 1) {
                this.currentSessionId = this.activeSessionList[0].id;
                this.loadStudents();
              }

              this.authService.currentUser$.subscribe((user) => {
                this.currentTeacherId = user ? user.id : undefined;
              });
            },
            error: (err) => {
              console.error('Ошибка загрузки активной сессии:', err);
            },
          });
        },
        error: (err) => {
          console.error('Ошибка загрузки шагов навыка:', err);
        },
      });
    }
  }

  onSessionChange(): void {
    if (typeof this.currentSessionId === 'number') {
      this.loadStudents();
      this.currentStudentId = undefined; // сбросим выбранного студента
    } else {
      this.studentIds = [];
    }
  }

  canSubmit(): boolean {
    return (
      typeof this.currentSessionId === 'number' &&
      typeof this.currentStudentId === 'number' &&
      this.stepScores.length === this.skillSteps.length &&
      this.grossErrors >= 0 &&
      this.grossErrors <= 100 &&
      this.minorErrors >= 0 &&
      this.minorErrors <= 100
    );
  }

  submitExam(): void {
    if (!this.canSubmit()) {
      console.error('Форма заполнена некорректно');
      return;
    } else {
      const skillTestResult = {
        id: -1,
        sessionId: this.currentSessionId as number,
        studentId: this.currentStudentId as number,
        teacherId: this.currentTeacherId as number,
        skillId: this.skillId as number,
        stepScores: this.skillSteps.map((step, index) => ({
          stepId: step.id,
          score: this.stepScores[index],
        })),
        lightMistakes: this.minorErrors,
        hardMistakes: this.grossErrors,
        resultDate: new Date().toISOString(),
      };

      this.examService.createResult(skillTestResult).subscribe({
        next: (result) => {
          alert('Результат экзамена успешно создан');
          this.resetForm();
        },
        error: (err) => {
          console.error('Ошибка при создании результата экзамена:', err);
        },
      });
    }
  }

  private clamp(n: number, min: number, max: number): number {
    const v = Number(n);
    return Math.max(min, Math.min(max, isNaN(v) ? min : v));
  }

  getStep(i: number): number {
    return this.clamp(this.stepScores[i] ?? 0, 0, 2);
  }

  setStep(i: number, val: number): void {
    this.stepScores[i] = this.clamp(val, 0, 2);
  }

  incStep(i: number): void {
    this.setStep(i, this.getStep(i) + 1);
  }

  decStep(i: number): void {
    this.setStep(i, this.getStep(i) - 1);
  }

  onStepInput(i: number, val: any): void {
    this.setStep(i, Number(val));
  }

  onGrossChange(val: any): void {
    this.grossErrors = this.clamp(Number(val), 0, 100);
  }

  onMinorChange(val: any): void {
    this.minorErrors = this.clamp(Number(val), 0, 100);
  }

  incGross(): void {
    this.onGrossChange(this.grossErrors + 1);
  }
  decGross(): void {
    this.onGrossChange(this.grossErrors - 1);
  }
  incMinor(): void {
    this.onMinorChange(this.minorErrors + 1);
  }
  decMinor(): void {
    this.onMinorChange(this.minorErrors - 1);
  }

  private resetForm(): void {
    this.stepScores = new Array(this.skillSteps.length).fill(0);
    this.grossErrors = 0;
    this.minorErrors = 0;
    this.currentStudentId = undefined;
    this.filteredStudents = [...this.studentIds];
    this.studentSearch = '';
  }

  onStepKeyPress(event: KeyboardEvent): void {
    const allowed = [
      '0',
      '1',
      '2',
      0,
      1,
      2,
      'Backspace',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
    ];
    if (!allowed.includes(event.key)) {
      event.preventDefault();
    }
  }

  onStepBlur(index: number, event: any): void {
    const value = event.target.value.trim();
    if (value === '0' || value === '1' || value === '2') {
      this.setStep(index, Number(value));
    } else {
      // если ввели что-то невалидное — сброс на 0
      this.setStep(index, 0);
      event.target.value = '0';
    }
  }

  studentSearch: string = '';
  filteredStudents: number[] = [];

  private loadStudents(): void {
    if (typeof this.currentSessionId === 'number') {
      this.sessionService.getSessionById(this.currentSessionId).subscribe({
        next: (session) => {
          this.studentIds = session.studentNumbers;
          this.filteredStudents = [...this.studentIds]; // показываем всех при загрузке
        },
        error: (err) => {
          console.error('Ошибка загрузки сессии:', err);
        },
      });
    } else {
      this.studentIds = [];
      this.filteredStudents = [];
    }
  }

  filterStudents(selectElement?: HTMLSelectElement): void {
    const query = this.studentSearch.trim().toLowerCase();

    if (query) {
      this.filteredStudents = this.studentIds.filter((id) =>
        id.toString().includes(query)
      );
    } else {
      this.filteredStudents = [...this.studentIds];
    }

    // Если остался один студент — выбираем его сразу
    if (this.filteredStudents.length === 1) {
      this.currentStudentId = this.filteredStudents[0];
    } else {
      this.currentStudentId = undefined;
    }
  }
}
