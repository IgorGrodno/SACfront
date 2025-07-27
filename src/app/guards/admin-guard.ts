import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { StorageService } from '../services/storage.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private storageService: StorageService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const isLoggedIn = this.storageService.isLoggedIn();
    const roles: string[] = this.storageService.getUserRoles();

    if (isLoggedIn && roles?.includes('ROLE_ADMIN' as unknown as string)) {
      return true;
    } else {
      return this.router.parseUrl('/login');
    }
  }
}
