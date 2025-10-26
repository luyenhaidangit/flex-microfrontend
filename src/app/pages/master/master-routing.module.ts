import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DepositMemberComponent } from './deposit-member/deposit-member.component';
import { SecuritiesDomainListComponent } from './securities-domain/securities-domain-list.component';
import { IssuersComponent } from './issuer/issuer.component';
import { SecuritiesComponent } from './securities/securities.component';

const routes: Routes = [
  { path: 'deposit-members', component: DepositMemberComponent },
  { path: 'securities-domain', component: SecuritiesDomainListComponent },
  { path: 'securities', component: SecuritiesComponent },
  { path: 'issuers', component: IssuersComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MasterRoutingModule {}
