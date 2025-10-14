import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from 'src/app/shared/shared.module';
import { UIModule } from 'src/app/shared/ui/ui.module';

import { OperationRoutingModule } from './operation-routing.module';
import { EndOfDayComponent } from './end-of-day/end-of-day.component';

@NgModule({
  declarations: [EndOfDayComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    UIModule,
    OperationRoutingModule
  ]
})
export class OperationModule {}

