import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ExchangeRoutingModule } from './exchange-routing.module';
import { MarketBoardComponent } from './market-board.component';
import { SessionManagementComponent } from './session-management.component';

@NgModule({
  declarations: [MarketBoardComponent, SessionManagementComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ExchangeRoutingModule]
})
export class ExchangeModule {}
