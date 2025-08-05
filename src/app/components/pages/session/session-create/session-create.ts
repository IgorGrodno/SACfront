import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Session } from '../../../../interfaces/session.interface';
import { SessionService } from '../../../../services/session.service';

@Component({
  selector: 'app-session-create',
  templateUrl: './session-create.html',
  styleUrls: ['./session-create.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class SessionCreate {
  startDate: string = '';
  active: boolean = false;
  studentRangeStart: number | null = null;
  studentRangeEnd: number | null = null;

  constructor(private sessionService: SessionService) {}

  createSession(): void {
    if (
      this.startDate &&
      this.studentRangeStart !== null &&
      this.studentRangeEnd !== null &&
      this.studentRangeStart <= this.studentRangeEnd
    ) {
      const studentNumbers: number[] = [];
      for (let i = this.studentRangeStart; i <= this.studentRangeEnd; i++) {
        studentNumbers.push(i);
      }

      const newSession: Session = {
        startDate: this.startDate,
        endDate: undefined,
        active: this.active,
        studentNumbers,
      };

      this.sessionService.createSession(newSession).subscribe({
        next: () => {
          alert('Сессия успешно создана!');
          this.resetForm();
        },
        error: (err) => {
          console.error('Ошибка при создании сессии:', err);
          alert('Ошибка при создании сессии');
        },
      });
    } else {
      alert('Пожалуйста, введите корректные данные.');
    }
  }

  private resetForm(): void {
    this.startDate = '';
    this.active = false;
    this.studentRangeStart = null;
    this.studentRangeEnd = null;
  }
}
