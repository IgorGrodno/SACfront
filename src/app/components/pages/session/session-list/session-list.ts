import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Session } from '../../../../interfaces/session.interface';
import { SessionService } from '../../../../services/session.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-session-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './session-list.html',
  styleUrls: ['./session-list.css'],
})
export class SessionList implements OnInit {
  sessions: Session[] = [];

  constructor(private sessionService: SessionService, private router: Router) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.sessionService.getAllSessions().subscribe({
      next: (data) => (this.sessions = data),
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
      error: (err) => console.error('Ошибка при удалении сессии:', err),
    });
  }

  toggleSessionActive(session: Session): void {
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
}
