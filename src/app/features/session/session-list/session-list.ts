import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Session } from '../../../interfaces/session.interface';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SessionService } from '../session.service';

@Component({
  selector: 'app-session-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './session-list.html',
  styleUrls: ['./session-list.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionList implements OnInit {
  sessions: Session[] = [];
  sessionName = '';
  startDate = '';
  active = true;
  studentRangeStart: number | null = null;
  studentRangeEnd: number | null = null;

  constructor(
    private sessionService: SessionService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.sessionService.getAllSessions().subscribe({
      next: (data) => {
        this.sessions = data;
        this.cdr.markForCheck(); // << ключевой момент для OnPush
      },
      error: (err) => console.error('Ошибка загрузки сессий:', err),
    });
  }

  deleteSession(sessionId: number): void {
    if (!confirm('Вы уверены, что хотите удалить сессию?')) return;

    this.sessionService.deleteSession(sessionId).subscribe({
      next: () => {
        this.sessions = this.sessions.filter((s) => s.id !== sessionId);
        console.log(`Сессия с ID ${sessionId} удалена`);
      },
    });
  }

  toggleSessionActive(session: Session, event: MouseEvent): void {
    // предотвращаем срабатывание перехода по клику на строку
    event.stopPropagation();

    const action = session.active ? 'Деактивировать' : 'Активировать';
    if (!confirm(`${action} сессию "${session.name}"?`)) return;

    this.sessionService
      .activateSession(session.id!, !session.active)
      .subscribe({
        next: () => {
          session.active = !session.active;
          console.log(
            `Сессия "${session.name}" ${
              session.active ? 'активирована' : 'деактивирована'
            }`
          );
        },
        error: (err) => console.error('Ошибка при обновлении сессии:', err),
      });
  }

  viewSessionDetails(sessionId: number): void {
    this.router.navigate(['/test-result', sessionId]);
  }

  createSession(): void {
    if (!this.validateForm()) return;

    const studentNumbers = this.generateStudentNumbers();

    const newSession: Session = {
      name: this.sessionName.trim(),
      startDate: this.startDate,
      endDate: undefined,
      active: this.active,
      studentNumbers,
    };

    this.sessionService.createSession(newSession).subscribe({
      next: () => {
        alert('Сессия успешно создана!');
        this.resetForm();
        this.loadSessions();
      },
    });
  }

  private validateForm(): boolean {
    if (
      !this.sessionName.trim() ||
      !this.startDate ||
      this.studentRangeStart === null ||
      this.studentRangeEnd === null ||
      this.studentRangeStart > this.studentRangeEnd
    ) {
      alert('Пожалуйста, введите корректные данные.');
      return false;
    }
    return true;
  }

  private generateStudentNumbers(): number[] {
    const numbers: number[] = [];
    for (let i = this.studentRangeStart!; i <= this.studentRangeEnd!; i++) {
      numbers.push(i);
    }
    return numbers;
  }

  private resetForm(): void {
    this.sessionName = '';
    this.startDate = '';
    this.active = true;
    this.studentRangeStart = null;
    this.studentRangeEnd = null;
  }
}
