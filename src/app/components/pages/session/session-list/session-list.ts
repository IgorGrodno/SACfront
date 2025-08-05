import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Session } from '../../../../interfaces/session.interface';
import { SessionService } from '../../../../services/session.service';

@Component({
  selector: 'app-session-list',
  templateUrl: './session-list.html',
  styleUrls: ['./session-list.css'],
  standalone: true,
  imports: [CommonModule],
})
export class SessionList implements OnInit {
  sessions: Session[] = [];

  constructor(private sessionService: SessionService) {}

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
        console.log('Сессия удалена');
        this.sessions = this.sessions.filter((s) => s.id !== sessionId);
      },
      error: (err) => console.error('Ошибка при удалении сессии:', err),
    });
  }

  deactivateSession(id: number, session: Session): void {
    if (!confirm(`Деактивировать сессию с ID ${session.id}?`)) return;

    const updatedSession = { ...session, active: false };

    this.sessionService.updateSession(id, updatedSession).subscribe({
      next: () => {
        session.active = false; // обновляем локально
        console.log(`Сессия с ID ${session.id} деактивирована`);
      },
      error: (err) => console.error('Ошибка при деактивации сессии:', err),
    });
  }
}
