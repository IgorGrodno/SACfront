import { Routes } from '@angular/router';
import { Login } from './components/pages/login/login';
import { Registration } from './components/pages/registration/registration';
import { UsersList } from './components/pages/user/users-list/users-list';
import { SessionCreate } from './components/pages/session/session-create/session-create';
import { SessionList } from './components/pages/session/session-list/session-list';
import { SkillCreate } from './components/pages/skill/skill-create/skill-create';

export const routes: Routes = [
  {
    path: '',
    component: Login,
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
  },
  {
    path: 'session-create',
    component: SessionCreate,
  },
  {
    path: 'session-list',
    component: SessionList,
  },
  {
    path: 'skill-create',
    component: SkillCreate,
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
