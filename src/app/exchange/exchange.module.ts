import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ExchangeRoutingModule } from './exchange-routing.module';
import { MarketBoardComponent } from './market-board.component';

@NgModule({
  declarations: [MarketBoardComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ExchangeRoutingModule]
})
export class ExchangeModule {}
