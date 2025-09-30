import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SkillService } from '../skill.service';
import { SessionService } from '../../session/session.service';
import { SkillTestResultsService } from '../../session/skill-test-results.service';
import { ExamService } from '../exam.service';
import { AuthService } from '../../../shared/services/auth.service';
import { Session } from '../../../interfaces/session.interface';
import { Skill } from '../../../interfaces/skill.interface';
import { SkillStep } from '../../../interfaces/skillStep.interface';

@Component({
  selector: 'app-skill-exam',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './skill-exam.html',
  styleUrls: ['./skill-exam.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class SkillExam implements OnInit {
  skill?: Skill;
  skillSteps: SkillStep[] = [];
  stepScores: number[] = [];

  activeSessionList: Session[] = [];
  currentSessionId?: number;

  studentIds: number[] = [];
  filteredStudents: number[] = [];
  currentStudentId?: number;
  studentSearch = '';

  currentTeacherId?: number;
  score = 0;

  constructor(
    private route: ActivatedRoute,
    private skillService: SkillService,
    private sessionService: SessionService,
    private skillTestResultsService: SkillTestResultsService,
    private examService: ExamService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const skillId = Number(this.route.snapshot.paramMap.get('id'));
    if (!skillId) return;

    this.loadSkill(skillId);
    this.loadSkillSteps(skillId);
    this.loadActiveSessions();

    this.authService.currentUser$.subscribe((user) => {
      this.currentTeacherId = user?.id;
    });
  }

  private loadSkill(skillId: number): void {
    this.skillService.getSkill(skillId).subscribe((skill) => {
      this.skill = skill;
      this.cdr.markForCheck();
    });
  }

  private loadSkillSteps(skillId: number): void {
    this.skillService.getSkillSteps(skillId).subscribe((steps) => {
      this.skillSteps = steps;
      this.stepScores = Array(steps.length).fill(0);
      this.cdr.markForCheck();
    });
  }

  private loadActiveSessions(): void {
    this.sessionService.getActiveSessions().subscribe((sessions) => {
      this.activeSessionList = sessions;
      if (sessions.length === 1) {
        this.currentSessionId = sessions[0].id;
        this.loadStudents();
      }
      this.cdr.markForCheck();
    });
  }

  onSessionChange(): void {
    this.currentStudentId = undefined;
    this.studentSearch = '';
    this.loadStudents();
  }

  private loadStudents(): void {
    if (!this.currentSessionId) return;

    this.sessionService
      .getSessionById(this.currentSessionId)
      .subscribe((session) => {
        this.studentIds = session.studentNumbers;
        this.loadSkillTestResults();
        this.cdr.markForCheck();
      });
  }

  private loadSkillTestResults(): void {
    if (!this.currentSessionId) return;
    this.skillTestResultsService
      .getBySessionId(this.currentSessionId)
      .subscribe((results) => {
        const passedStudents = results
          .filter((r) => r.skillId === this.skill?.id)
          .map((r) => r.studentId);
        this.filteredStudents = this.studentIds.filter(
          (id) => !passedStudents.includes(id)
        );
      });
  }

  filterStudents(): void {
    const query = this.studentSearch.trim();
    this.filteredStudents = query
      ? this.studentIds.filter((id) => id.toString().includes(query))
      : [...this.studentIds];

    if (this.filteredStudents.length === 1) {
      this.currentStudentId = this.filteredStudents[0];
    }
  }

  getStep(index: number): number {
    return this.stepScores[index] ?? 0;
  }

  setStep(index: number, value: number): void {
    this.stepScores[index] = this.clamp(value, 0, 2);
    this.calculateScore();
  }

  incStep(index: number): void {
    this.setStep(index, this.getStep(index) + 1);
  }

  decStep(index: number): void {
    this.setStep(index, this.getStep(index) - 1);
  }

  onStepKeyPress(event: KeyboardEvent): void {
    if (
      !['0', '1', '2', 'Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(
        event.key
      )
    ) {
      event.preventDefault();
    }
  }

  onStepBlur(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    this.setStep(index, ['0', '1', '2'].includes(value) ? Number(value) : 0);
    input.value = this.getStep(index).toString();
  }

  private calculateScore(): void {
    const max = this.skillSteps.length * 2;
    const total = this.stepScores.reduce((a, b) => a + b, 0);
    this.score = Math.round((total / max) * 100);
  }

  canSubmit(): boolean {
    return !!this.currentSessionId && !!this.currentStudentId;
  }

  submitExam(): void {
    if (!this.canSubmit()) return;

    const payload = {
      id: -1,
      sessionId: this.currentSessionId!,
      studentId: this.currentStudentId!,
      teacherId: this.currentTeacherId!,
      skillId: this.skill?.id ?? -1,
      stepScores: this.skillSteps.map((s, i) => ({
        stepId: s.id,
        score: this.stepScores[i],
      })),
      resultDate: new Date().toISOString(),
    };

    this.examService.createResult(payload).subscribe(() => {
      alert('Результат успешно создан');
      this.resetForm();
      this.loadStudents();
    });
  }

  private resetForm(): void {
    this.stepScores = Array(this.skillSteps.length).fill(0);
    this.currentStudentId = undefined;
    this.studentSearch = '';
    this.score = 0;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
}
