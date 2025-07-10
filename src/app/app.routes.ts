import { Routes } from '@angular/router';
import { Login } from './components/pages/login/login';
import { Registration } from './components/pages/registration/registration';
import { SkillTest } from './components/pages/skilltest/skilltest';
import { AllSkills } from './components/pages/all-skills/all-skills';

export const routes: Routes = [
  {
    path: '',
    component: AllSkills,
  },
  {
    path: 'skilltest/:id',
    component: SkillTest,
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
