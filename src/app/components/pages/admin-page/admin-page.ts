import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Adminpageskills } from './admin-pages/adminpageskills/adminpageskills';
import { AdminPageUsers } from './admin-pages/adminpageusers/adminpageusers';

@Component({
  selector: 'app-admin-page',
  imports: [CommonModule, AdminPageUsers, Adminpageskills],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.css',
})
export class AdminPage {
  selected: 'users' | 'skills' = 'users';

  select(view: 'users' | 'skills') {
    this.selected = view;
  }
}
