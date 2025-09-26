import { Routes } from '@angular/router';
import { Login } from './components/pages/login/login';
import { UsersList } from './components/pages/user/users-list/users-list';
import { SessionList } from './components/pages/session/session-list';
import { SkillCreate } from './components/pages/skill/skill-create/skill-create';
import { SkillList } from './components/pages/skill/skill-list/skill-list';
import { AdminGuard } from './guards/admin-guard';
import { AuthGuard } from './guards/auth-guard';
import { ProfilePage } from './components/pages/profile/profile';
import { DisciplineCreate } from './components/pages/discipline/discipline-create/discipline-create';
import { DisciplineList } from './components/pages/discipline/discipline-list/discipline-list';
import { DisciplineListExam } from './components/pages/discipline/discipline-list-exam/discipline-list-exam';
import { SkillExam } from './components/pages/skill/skill-exam/skill-exam';
import { SkillEdit } from './components/pages/skill/skill-edit/skill-edit';
import { TestResult } from './components/pages/test-result/test-result';
import { DisciplineEdit } from './components/pages/discipline/discipline-edit/discipline-edit';
import { CheckExamResult } from './components/pages/check-exam-result/check-exam-result';

export const routes: Routes = [
  {
    path: 'exam',
    component: DisciplineListExam,
    canActivate: [AuthGuard],
  },
  {
    path: 'test-result',
    component: TestResult,
    canActivate: [AdminGuard],
  },
  {
    path: 'test-result/:id',
    component: TestResult,
    canActivate: [AdminGuard],
  },
  {
    path: 'discipline-create',
    component: DisciplineCreate,
    canActivate: [AdminGuard],
  },
  {
    path: 'discipline-edit/:id',
    component: DisciplineEdit,
    canActivate: [AdminGuard],
  },
  {
    path: 'discipline-list',
    component: DisciplineList,
    canActivate: [AdminGuard],
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
    path: 'users-list',
    component: UsersList,
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
    path: 'skill-edit/:id',
    component: SkillEdit,
    canActivate: [AdminGuard],
  },
  {
    path: 'skill-list',
    component: SkillList,
    canActivate: [AuthGuard],
  },
  {
    path: 'skill-list/:id',
    component: SkillList,
    canActivate: [AuthGuard],
  },
  {
    path: 'skill-exam/:id',
    component: SkillExam,
    canActivate: [AuthGuard],
  },
  {
    path: 'profile/:id',
    component: ProfilePage,
    canActivate: [AuthGuard],
  },
  {
    path: '',
    component: CheckExamResult,
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
