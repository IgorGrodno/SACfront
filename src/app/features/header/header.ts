import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  standalone: true,
  styleUrls: ['./header.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  @Input() menuItems?: Map<string, string>;
  @Input() currentUser?: string;

  constructor(private authService: AuthService, private router: Router) {}

  get entries(): [string, string][] {
    return this.menuItems ? Array.from(this.menuItems.entries()) : [];
  }

  logout() {
    this.authService.logout().subscribe();
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
