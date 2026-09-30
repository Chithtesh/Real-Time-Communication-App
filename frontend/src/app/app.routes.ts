import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent) },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then((m) => m.RegisterComponent) },
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent), canActivate: [authGuard] },
  { path: 'create-meeting', loadComponent: () => import('./pages/create-meeting/create-meeting.component').then((m) => m.CreateMeetingComponent), canActivate: [authGuard] },
  { path: 'join-meeting', loadComponent: () => import('./pages/join-meeting/join-meeting.component').then((m) => m.JoinMeetingComponent), canActivate: [authGuard] },
  { path: 'meeting/:meetingId', loadComponent: () => import('./pages/meeting-room/meeting-room.component').then((m) => m.MeetingRoomComponent), canActivate: [authGuard] },
  { path: '**', redirectTo: 'home' },
];
