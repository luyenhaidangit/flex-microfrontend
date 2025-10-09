import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from 'src/app/shared/shared.module';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { PaginationModule as CustomPaginationModule } from 'src/app/core/components/pagination/pagination.module';

import { MasterRoutingModule } from './master-routing.module';
import { DepositMemberComponent } from './deposit-member/deposit-member.component';

@NgModule({
  declarations: [
    DepositMemberComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    UIModule,
    CustomPaginationModule,
    MasterRoutingModule
  ]
})
export class MasterModule {}
