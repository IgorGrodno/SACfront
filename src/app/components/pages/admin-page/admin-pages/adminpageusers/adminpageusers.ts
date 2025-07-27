import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../../../../interfaces/user.interface';
import { UserService } from '../../../../../services/admin.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-adminpageusers',
  imports: [CommonModule, FormsModule],
  templateUrl: './adminpageusers.html',
  styleUrl: './adminpageusers.css',
})
export class AdminPageUsers {
  users: User[] = [];
  searchQuery: string = '';
  allRoles: string[] = ['ROLE_ADMIN', 'ROLE_TEACHER', 'ROLE_STUDENT'];

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit() {
    this.userService.getAllUsers().subscribe((users: User[]) => {
      this.users = users;
      console.log('Users fetched:', this.users);
    });
  }

  isRoleChecked(user: User, roleName: string): boolean {
    return user.roles?.includes(roleName);
  }

  toggleRole(user: User, roleName: string, checked: boolean): void {
    if (checked) {
      if (!user.roles.includes(roleName)) {
        user.roles.push(roleName);
      }
    } else {
      user.roles = user.roles.filter((r) => r !== roleName);
    }
  }

  onRoleCheckboxChange(event: Event, user: User, roleName: string): void {
    const target = event.target as HTMLInputElement;
    const checked = target?.checked;
    this.toggleRole(user, roleName, checked);
  }

  updateUser(user: User): void {
    this.userService.updateUser(user).subscribe({
      next: () => console.log(`User ${user.id} updated`),
      error: (err: any) => console.error(err),
    });
  }

  navigateToUserDetails(userId: number) {
    this.router.navigate(['/userDetails', userId]);
  }

  filteredUsers() {
    return this.users.filter((user) =>
      user.username.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  deleteUser(userId: number) {
    this.userService.deleteUser(userId).subscribe(() => {
      this.users = this.users?.filter((user) => user.id !== userId);
    });
  }
}
