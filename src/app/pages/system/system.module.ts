import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SystemRoutingModule } from './system-routing.module';
import { UIModule } from '../../shared/ui/ui.module';
import { ReactiveFormsModule } from '@angular/forms';

// dropzone
import { NgxDropzoneModule } from 'ngx-dropzone';
import { FormsModule } from '@angular/forms';

import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TabsModule } from 'ngx-bootstrap/tabs';

import { NgApexchartsModule } from 'ng-apexcharts';
import { BranchComponent } from './branch/branch.component';

import { RoleComponent } from './role/role.component';
import { SharedModule } from '../../shared/shared.module';
import { UsersComponent } from './user/user.component';
import { UserDetailModalComponent } from './user/user-detail-modal/user-detail-modal.component';
import { CreateUserModalComponent } from './user/create-user-modal/create-user-modal.component';
import { EditUserModalComponent } from './user/edit-user-modal/edit-user-modal.component';
import { PaginationModule as CustomPaginationModule } from '../../core/components/pagination/pagination.module';

@NgModule({
  declarations: [BranchComponent, RoleComponent, UsersComponent, UserDetailModalComponent, CreateUserModalComponent, EditUserModalComponent],
  imports: [
    CommonModule,
    SystemRoutingModule,
    UIModule,
    BsDropdownModule.forRoot(),
    TooltipModule.forRoot(),
    NgApexchartsModule,
    NgxDropzoneModule,
    FormsModule,
    BsDatepickerModule.forRoot(),
    PaginationModule.forRoot(),
    ReactiveFormsModule,
    SharedModule,
    TabsModule.forRoot(),
    CustomPaginationModule
  ]
})

export class SystemModule { }
