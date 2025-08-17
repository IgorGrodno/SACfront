import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../services/user.service';
import { User } from '../../../../interfaces/user.interface';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user',
  templateUrl: 'users-list.html',
  styleUrls: ['users-list.css'],
  standalone: true,
  imports: [CommonModule],
})
export class UsersList implements OnInit {
  users: User[] = [];
  allRoles: string[] = ['ROLE_ADMIN', 'ROLE_TEACHER', 'ROLE_STUDENT'];

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => (this.users = data),
      error: (err) => console.error('Ошибка загрузки пользователей:', err),
    });
  }

  toggleRole(user: User, role: string): void {
    if (user.roles.includes(role)) {
      user.roles = user.roles.filter((r) => r !== role);
    } else {
      user.roles.push(role);
    }
  }

  saveChanges(user: User): void {
    this.userService.updateUser(user).subscribe({
      next: () => alert(`Роли пользователя ${user.username} обновлены.`),
      error: (err) => alert('Ошибка при обновлении пользователя'),
    });
  }

  hasRole(user: User, role: string): boolean {
    return user.roles.includes(role);
  }

  deleteUser(userId: number): void {
    if (confirm('Вы действительно хотите удалить этого пользователя?')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.users = this.users.filter((user) => user.id !== userId);
          console.log(`Пользователь с ID ${userId} удалён.`);
        },
        error: (err) => console.error('Ошибка при удалении пользователя:', err),
      });
    }
  }

  goToProfile(id: number) {
    this.router.navigate(['/profile', id]);
  }
}
