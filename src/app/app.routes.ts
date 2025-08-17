import { Routes } from '@angular/router';
import { Login } from './components/pages/login/login';
import { Registration } from './components/pages/registration/registration';
import { UsersList } from './components/pages/user/users-list/users-list';
import { SessionCreate } from './components/pages/session/session-create/session-create';
import { SessionList } from './components/pages/session/session-list/session-list';
import { SkillCreate } from './components/pages/skill/skill-create/skill-create';
import { SkillList } from './components/pages/skill/skill-list/skill-list';
import { AdminGuard } from './guards/admin-guard';
import { AuthGuard } from './guards/auth-guard';
import { ProfilePage } from './components/pages/profile/profile';

export const routes: Routes = [
  {
    path: '',
    component: Login,
  },
  {
    path: 'profile',
    component: ProfilePage,
    canActivate: [AuthGuard],
  },
  {
    path: 'profile/:id',
    component: ProfilePage,
    canActivate: [AdminGuard],
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
    path: 'users-list',
    component: UsersList,
    canActivate: [AdminGuard],
  },
  {
    path: 'session-create',
    component: SessionCreate,
    canActivate: [AdminGuard],
  },
  {
    path: 'session-list',
    component: SessionList,
    canActivate: [AdminGuard],
  },
  {
    path: 'skill-create',
    component: SkillCreate,
    canActivate: [AdminGuard],
  },
  {
    path: 'skill-list',
    component: SkillList,
    canActivate: [AuthGuard],
  },
  {
    path: 'profile/:id',
    component: ProfilePage,
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
