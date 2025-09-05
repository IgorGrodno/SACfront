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

  activateSession(id: number, active: boolean): void {
    const session = this.sessions.find((s) => s.id === id);
    if (!session) return;

    const action = active ? 'Активировать' : 'Деактивировать';
    if (!confirm(`${action} сессию с ID ${id}?`)) return;

    this.sessionService.activateSession(id, active).subscribe({
      next: () => {
        session.active = active; // обновляем локально
        console.log(
          `Сессия с ID ${id} ${active ? 'активирована' : 'деактивирована'}`
        );
      },
      error: (err) => console.error('Ошибка при обновлении сессии:', err),
    });
  }
}
