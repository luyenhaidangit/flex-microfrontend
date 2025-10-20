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
import { ApproveUserModalComponent } from './issuer/approve-user-modal/approve-user-modal.component';
import { RejectUserModalComponent } from './issuer/reject-user-modal/reject-user-modal.component';
import { DeleteUserModalComponent } from './issuer/delete-user-modal/delete-user-modal.component';
import { EditUserModalComponent } from './issuer/edit-user-modal/edit-user-modal.component';
import { CreateUserModalComponent } from './issuer/create-issuer-modal/create-user-modal.component';
import { UserDetailModalComponent } from './issuer/user-detail-modal/user-detail-modal.component';
import { UserRequestDetailModalComponent } from './issuer/user-request-detail-modal/user-request-detail-modal.component';

@NgModule({
  declarations: [
    DepositMemberComponent,
    SecuritiesDomainListComponent,
    IssuersComponent,
    ApproveUserModalComponent,
    RejectUserModalComponent,
    DeleteUserModalComponent,
    EditUserModalComponent,
    CreateUserModalComponent,
    UserDetailModalComponent,
    UserRequestDetailModalComponent
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
