import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from 'src/app/shared/shared.module';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { PaginationModule as CustomPaginationModule } from 'src/app/core/components/pagination/pagination.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

import { MasterRoutingModule } from './master-routing.module';
import { DepositMemberComponent } from './deposit-member/deposit-member.component';
import { SecuritiesDomainListComponent } from './securities-domain/securities-domain-list.component';
import { IssuersComponent } from './issuer/issuer.component';

@NgModule({
  declarations: [
    DepositMemberComponent,
    SecuritiesDomainListComponent,
    IssuersComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    UIModule,
    CustomPaginationModule,
    BsDatepickerModule.forRoot(),
    MasterRoutingModule
  ]
})
export class MasterModule {}
