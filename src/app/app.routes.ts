import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { DashboardComponent } from './components/dashboard/dashboard';
import { InventoryDetailComponent } from './components/inventory-detail/inventory-detail';
import { CreateInventoryComponent } from './components/create-inventory/create-inventory';
import { AdminPanelComponent } from './components/admin-panel/admin-panel';
import { SearchComponent } from './components/search/search';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'search', component: SearchComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminPanelComponent, canActivate: [authGuard] },
  { path: 'inventories/create', component: CreateInventoryComponent, canActivate: [authGuard] },
  { path: 'inventories/:id/edit', component: CreateInventoryComponent, canActivate: [authGuard] },
  { path: 'inventories/:id', component: InventoryDetailComponent },
  { path: '**', redirectTo: '' }
];
