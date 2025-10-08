import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SecuritiesDomainListComponent } from './securities-domain/securities-domain-list.component';

const routes: Routes = [
  { path: 'domains', component: SecuritiesDomainListComponent },
  { path: 'payment-methods', loadComponent: () => import('./securities-payment-methods/securities-payment-methods.component').then(m => m.SecuritiesPaymentMethodsComponent) },
  { path: '', redirectTo: 'domains', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SecuritiesRoutingModule {}

