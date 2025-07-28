import { Routes } from '@angular/router';
import { Login } from './components/pages/login/login';
import { Registration } from './components/pages/registration/registration';
import { SkillTest } from './components/pages/skilltest/skilltest';
import { AdminPage } from './components/pages/admin-page/admin-page';
import { AdminGuard } from './guards/admin-guard';
import { AuthGuard } from './guards/auth-guard';
import { Profile } from './components/pages/profile/profile';

export const routes: Routes = [
  {
    path: 'adminpage',
    component: AdminPage,
    canActivate: [AdminGuard],
  },
  {
    path: 'skilltest/:id',
    component: SkillTest,
    canActivate: [AuthGuard],
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'registration',
    component: Registration,
  },
  {
    path: 'profile',
    component: Profile,
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
