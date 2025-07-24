import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../../interfaces/user.interface';
import { UserService } from '../../../services/admin.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-page',
  imports: [CommonModule],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.css',
})
export class AdminPage {
  users: User[] | undefined;

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit() {
    this.userService.getAllUsers().subscribe((users: User[]) => {
      this.users = users;
      console.log('Users fetched:', this.users);
    });
  }

  deleteUser(userId: number) {
    this.userService.deleteUser(userId).subscribe(() => {
      this.users = this.users?.filter((user) => user.id !== userId);
    });
  }
}
