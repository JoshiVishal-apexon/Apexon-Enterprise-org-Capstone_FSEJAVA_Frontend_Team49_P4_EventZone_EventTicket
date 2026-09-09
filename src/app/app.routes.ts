import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/events/event-list/event-list').then((m) => m.EventListComponent)
  },
  {
    path: 'events/:id',
    loadComponent: () =>
      import('./features/events/event-detail/event-detail').then((m) => m.EventDetailComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register').then((m) => m.RegisterComponent)
  },
  {
    path: 'my-bookings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/bookings/my-bookings/my-bookings').then((m) => m.MyBookingsComponent)
  },
  {
    path: 'organiser',
    canActivate: [roleGuard('ORGANISER')],
    loadComponent: () =>
      import('./features/organiser/organiser/organiser-dashboard/organiser-dashboard').then(
        (m) => m.OrganiserDashboardComponent
      )
  },
  {
    path: 'admin',
    canActivate: [roleGuard('ADMIN')],
    loadComponent: () =>
      import('./features/admin/admin/admin-panel/admin-panel').then((m) => m.AdminPanelComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
