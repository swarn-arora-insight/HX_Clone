import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';
import { authGuard } from './guards/auth-guard';
import { ShortlistedAgents } from './shortlisted-agents/shortlisted-agents';

export const routes: Routes = [
    { path: '', component: Login },
    { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
    { path: 'shortlist', component: ShortlistedAgents, canActivate: [authGuard] },
    { path: '**', redirectTo: '' }
];
