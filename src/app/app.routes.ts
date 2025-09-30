import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';
import { AdminGuard } from './guards/admin-guard';

export const routes: Routes = [
  {
    path: 'exam',
    loadComponent: () =>
      import(
        './features/discipline/discipline-list-exam/discipline-list-exam'
      ).then((m) => m.DisciplineListExam),
    canActivate: [AuthGuard],
  },
  {
    path: 'test-result/:id',
    loadComponent: () =>
      import('./features/session/test-result/test-result').then(
        (m) => m.TestResult
      ),
    canActivate: [AdminGuard],
  },
  {
    path: 'discipline-create',
    loadComponent: () =>
      import('./features/discipline/discipline-create/discipline-create').then(
        (m) => m.DisciplineCreate
      ),
    canActivate: [AdminGuard],
  },
  {
    path: 'discipline-edit/:id',
    loadComponent: () =>
      import('./features/discipline/discipline-edit/discipline-edit').then(
        (m) => m.DisciplineEdit
      ),
    canActivate: [AdminGuard],
  },
  {
    path: 'discipline-list',
    loadComponent: () =>
      import('./features/discipline/discipline-list/discipline-list').then(
        (m) => m.DisciplineList
      ),
    canActivate: [AdminGuard],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/user/profile/profile').then((m) => m.ProfilePage),
    canActivate: [AuthGuard],
  },
  {
    path: 'profile/:id',
    loadComponent: () =>
      import('./features/user/profile/profile').then((m) => m.ProfilePage),
    canActivate: [AdminGuard],
  },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  {
    path: 'users-list',
    loadComponent: () =>
      import('./features/user/users-list/users-list').then((m) => m.UsersList),
    canActivate: [AdminGuard],
  },
  {
    path: 'session-list',
    loadComponent: () =>
      import('./features/session/session-list/session-list').then(
        (m) => m.SessionList
      ),
    canActivate: [AdminGuard],
  },
  {
    path: 'skill-create',
    loadComponent: () =>
      import('./features/skill/skill-create/skill-create').then(
        (m) => m.SkillCreate
      ),
    canActivate: [AdminGuard],
  },
  {
    path: 'skill-edit/:id',
    loadComponent: () =>
      import('./features/skill/skill-edit/skill-edit').then((m) => m.SkillEdit),
    canActivate: [AdminGuard],
  },
  {
    path: 'skill-list',
    loadComponent: () =>
      import('./features/skill/skill-list/skill-list').then((m) => m.SkillList),
    canActivate: [AuthGuard],
  },
  {
    path: 'skill-list/:id',
    loadComponent: () =>
      import('./features/skill/skill-list/skill-list').then((m) => m.SkillList),
    canActivate: [AuthGuard],
  },
  {
    path: 'skill-exam/:id',
    loadComponent: () =>
      import('./features/skill/skill-exam/skill-exam').then((m) => m.SkillExam),
    canActivate: [AuthGuard],
  },
  {
    path: '',
    loadComponent: () =>
      import('./features/check-exam-result/check-exam-result').then(
        (m) => m.CheckExamResult
      ),
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
