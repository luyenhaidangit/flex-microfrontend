import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MarketBoardComponent } from './market-board.component';
import { SessionManagementComponent } from './session-management.component';

const routes: Routes = [
  { path: '', component: MarketBoardComponent },
  { path: 'session', component: SessionManagementComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExchangeRoutingModule {}
