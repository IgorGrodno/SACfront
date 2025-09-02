import { Component } from '@angular/core';
import { SkillService } from '../../../../services/skill.service';
import { SkillStep } from '../../../../interfaces/skillStep.interface';
import { ActivatedRoute } from '@angular/router';
import { SessionService } from '../../../../services/session.service';
import { AuthService } from '../../../../services/auth.service';
import { Session } from '../../../../interfaces/session.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  constructor(
    private skillService: SkillService,
    private route: ActivatedRoute,
    private sessionService: SessionService,
    private authService: AuthService
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

  private loadStudents(): void {
    if (typeof this.currentSessionId === 'number') {
      this.sessionService.getSessionById(this.currentSessionId).subscribe({
        next: (session) => {
          console.log(session);
          this.studentIds = session.studentNumbers;
        },
        error: (err) => {
          console.error('Ошибка загрузки сессии:', err);
        },
      });
    } else {
      this.studentIds = [];
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
    }

    const examResult = {
      teacherId: this.currentTeacherId,
      sessionId: this.currentSessionId,
      studentId: this.currentStudentId,
      skillId: this.skillId,
      steps: this.skillSteps.map((step, index) => ({
        stepId: step.id,
        score: this.stepScores[index],
      })),
      grossErrors: this.grossErrors,
      minorErrors: this.minorErrors,
    };

    console.log('Отправка экзамена:', examResult);
  }
}
