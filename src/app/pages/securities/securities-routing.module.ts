import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SecuritiesDomainListComponent } from './securities-domain/securities-domain-list.component';

const routes: Routes = [
  { path: 'domains', component: SecuritiesDomainListComponent },
  { path: '', redirectTo: 'domains', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SecuritiesRoutingModule {}

