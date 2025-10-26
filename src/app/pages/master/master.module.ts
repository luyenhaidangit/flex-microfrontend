import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from 'src/app/shared/shared.module';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { PaginationModule as CustomPaginationModule } from 'src/app/core/components/pagination/pagination.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

import { MasterRoutingModule } from './master-routing.module';
import { DepositMemberComponent } from './deposit-member/deposit-member.component';
import { SecuritiesDomainListComponent } from './securities-domain/securities-domain-list.component';
import { SecuritiesComponent } from './securities/securities.component';
import { IssuersComponent } from './issuer/issuer.component';
import { ApproveIssuerModalComponent } from './issuer/approve-issuer-modal/approve-issuer-modal.component';
import { RejectIssuerModalComponent } from './issuer/reject-issuer-modal/reject-issuer-modal.component';
import { DeleteIssuerModalComponent } from './issuer/delete-issuer-modal/delete-issuer-modal.component';
import { EditIssuerModalComponent } from './issuer/edit-issuer-modal/edit-issuer-modal.component';
import { CreateIssuerModalComponent } from './issuer/create-issuer-modal/create-issuer-modal.component';
import { IssuerDetailModalComponent } from './issuer/issuer-detail-modal/issuer-detail-modal.component';
import { IssuerRequestDetailModalComponent } from './issuer/issuer-request-detail-modal/issuer-request-detail-modal.component';

@NgModule({
  declarations: [
    DepositMemberComponent,
    SecuritiesDomainListComponent,
    SecuritiesComponent,
    IssuersComponent,
    ApproveIssuerModalComponent,
    RejectIssuerModalComponent,
    DeleteIssuerModalComponent,
    EditIssuerModalComponent,
    CreateIssuerModalComponent,
    IssuerDetailModalComponent,
    IssuerRequestDetailModalComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    UIModule,
    CustomPaginationModule,
    BsDatepickerModule.forRoot(),
    MasterRoutingModule
  ]
})
export class MasterModule {}
