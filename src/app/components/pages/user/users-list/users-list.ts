import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../services/user.service';
import { User } from '../../../../interfaces/user.interface';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProfileService } from '../../../../services/profile.service';
import { Profile } from '../../../../interfaces/profile.interface';
import { forkJoin } from 'rxjs';

interface UserWithProfile extends User {
  profile?: Profile;
}

@Component({
  selector: 'app-user',
  templateUrl: 'users-list.html',
  styleUrls: ['users-list.css'],
  standalone: true,
  imports: [CommonModule],
})
export class UsersList implements OnInit {
  users: UserWithProfile[] = [];
  allRoles: string[] = ['ROLE_ADMIN', 'ROLE_TEACHER', 'ROLE_STUDENT'];
  changedUsers = new Set<number>();

  constructor(
    private userService: UserService,
    private router: Router,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        // Загружаем профили для каждого пользователя
        const profileRequests = data.map((user) =>
          this.profileService.getProfile(user.id)
        );

        forkJoin(profileRequests).subscribe({
          next: (profiles) => {
            this.users = data.map((user, index) => ({
              ...user,
              profile: profiles[index],
            }));
          },
          error: (err) =>
            console.error('Ошибка загрузки профилей пользователей:', err),
        });
      },
      error: (err) => console.error('Ошибка загрузки пользователей:', err),
    });
  }

  toggleRole(user: UserWithProfile, role: string): void {
    user.roles = user.roles.includes(role)
      ? user.roles.filter((r) => r !== role)
      : [...user.roles, role];

    if (this.changedUsers.has(user.id)) {
      this.changedUsers.delete(user.id);
    } else {
      this.changedUsers.add(user.id);
    }
  }

  saveChanges(user: UserWithProfile): void {
    if (!this.changedUsers.has(user.id)) return;

    this.userService.updateUser(user).subscribe({
      next: () => {
        alert(
          `Роли пользователя ${
            user.profile?.secondName ?? user.username
          } обновлены.`
        );
        this.changedUsers.delete(user.id);
      },
      error: () => alert('Ошибка при обновлении пользователя'),
    });
  }

  hasRole(user: UserWithProfile, role: string): boolean {
    return user.roles.includes(role);
  }

  deleteUser(userId: number): void {
    if (!confirm('Вы действительно хотите удалить этого пользователя?')) return;

    this.userService.deleteUser(userId).subscribe({
      next: () => {
        this.users = this.users.filter((user) => user.id !== userId);
        this.changedUsers.delete(userId);
        console.log(`Пользователь с ID ${userId} удалён.`);
      },
      error: (err) => console.error('Ошибка при удалении пользователя:', err),
    });
  }

  goToProfile(id: number) {
    this.router.navigate(['/profile', id]);
  }

  getFullName(user: UserWithProfile): string {
    if (!user.profile) return user.username; // fallback
    return `${user.profile.secondName} ${user.profile.firstName} ${user.profile.fatherName}`;
  }
}
