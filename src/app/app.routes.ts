import { Routes } from '@angular/router';
import { Login } from './components/pages/login/login';
import { Registration } from './components/pages/registration/registration';
import { SkillTest } from './components/pages/skilltest/skilltest';
import { AllSkills } from './components/pages/all-skills/all-skills';
import { AdminPage } from './components/pages/admin-page/admin-page';
import { AdminGuard } from './guards/admin-guard';
import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: 'skills',
    component: AllSkills,
    canActivate: [AuthGuard],
  },
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
    path: '**',
    redirectTo: '',
  },
];
