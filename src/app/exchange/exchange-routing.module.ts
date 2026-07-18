import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MarketBoardComponent } from './market-board.component';

const routes: Routes = [{ path: '', component: MarketBoardComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExchangeRoutingModule {}
