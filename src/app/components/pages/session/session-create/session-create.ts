import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Session } from '../../../../interfaces/session.interface';
import { SessionService } from '../../../../services/session.service';

@Component({
  selector: 'app-session-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './session-create.html',
  styleUrls: ['./session-create.css'],
})
export class SessionCreate {
  sessionName = '';
  startDate = '';
  active = true;
  studentRangeStart: number | null = null;
  studentRangeEnd: number | null = null;

  constructor(private sessionService: SessionService) {}

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
      },
      error: (err) => {
        console.error('Ошибка при создании сессии:', err);
        alert('Ошибка при создании сессии');
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
