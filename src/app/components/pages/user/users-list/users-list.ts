import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../services/user.service';
import { User } from '../../../../interfaces/user.interface';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProfileService } from '../../../../services/profile.service';
import { Profile } from '../../../../interfaces/profile.interface';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';

interface UserWithProfile extends User {
  profile?: Profile;
}

@Component({
  selector: 'app-user',
  templateUrl: 'users-list.html',
  styleUrls: ['users-list.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class UsersList implements OnInit {
  users: UserWithProfile[] = [];
  allRoles: string[] = ['ROLE_ADMIN', 'ROLE_TEACHER', 'ROLE_STUDENT'];
  changedUsers = new Set<number>();
  newUser: { username: string; password: string } = {
    username: '',
    password: '',
  };

  constructor(
    private userService: UserService,
    private router: Router,
    private profileService: ProfileService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
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
        });
      },
    });
  }

  toggleRole(user: UserWithProfile, role: string): void {
    if (!user.roles) {
      user.roles = [];
    }
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
    });
  }

  hasRole(user: UserWithProfile, role: string): boolean {
    return (user.roles ?? []).includes(role);
  }

  deleteUser(userId: number): void {
    if (!confirm('Вы действительно хотите удалить этого пользователя?')) return;

    this.userService.deleteUser(userId).subscribe({
      next: () => {
        this.users = this.users.filter((user) => user.id !== userId);
        this.changedUsers.delete(userId);
        console.log(`Пользователь с ID ${userId} удалён.`);
      },
    });
  }

  goToProfile(id: number) {
    this.router.navigate(['/profile', id]);
  }

  getFullName(user: UserWithProfile): string {
    const second = user.profile?.secondName ?? '';
    const first = user.profile?.firstName ?? '';
    const father = user.profile?.fatherName ?? '';

    const full = [second, first, father].filter(Boolean).join(' ');
    return full || 'Профиль не заполнен';
  }

  addUser() {
    if (!this.newUser.username || !this.newUser.password) {
      alert('Введите логин и пароль');
      return;
    }

    this.authService
      .register({
        username: this.newUser.username,
        password: this.newUser.password,
      })
      .subscribe({
        next: (createdUser) => {
          this.loadUsers();
          this.newUser = { username: '', password: '' };
        },
      });
  }
}
