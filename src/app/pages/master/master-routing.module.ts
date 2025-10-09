import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DepositMemberComponent } from './deposit-member/deposit-member.component';

const routes: Routes = [
  { path: 'deposit-members', component: DepositMemberComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MasterRoutingModule {}

