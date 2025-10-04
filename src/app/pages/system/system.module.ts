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
import { ModalModule } from 'ngx-bootstrap/modal';

import { NgApexchartsModule } from 'ng-apexcharts';
import { BranchComponent } from './branch/branch.component';

import { RoleComponent } from './role/role.component';
import { SharedModule } from '../../shared/shared.module';
import { UsersComponent } from './user/user.component';
import { UserDetailModalComponent } from './user/user-detail-modal/user-detail-modal.component';
import { CreateUserModalComponent } from './user/create-user-modal/create-user-modal.component';
import { EditUserModalComponent } from './user/edit-user-modal/edit-user-modal.component';
import { DeleteUserModalComponent } from './user/delete-user-modal/delete-user-modal.component';
import { ApproveUserModalComponent } from './user/approve-user-modal/approve-user-modal.component';
import { RejectUserModalComponent } from './user/reject-user-modal/reject-user-modal.component';
import { UserRequestDetailModalComponent } from './user/user-request-detail-modal/user-request-detail-modal.component';
import { PaginationModule as CustomPaginationModule } from '../../core/components/pagination/pagination.module';
import { WorkflowComponent } from './workflow/workflow.component';
import { ApproveWorkflowModalComponent } from './workflow/approve-workflow-modal/approve-workflow-modal.component';
import { RejectWorkflowModalComponent } from './workflow/reject-workflow-modal/reject-workflow-modal.component';
import { WorkflowDetailModalComponent } from './workflow/workflow-detail-modal/workflow-detail-modal.component';
import { CreateWorkflowModalComponent } from './workflow/create-workflow-modal/create-workflow-modal.component';
import { WorkflowRequestDetailModalComponent } from './workflow/workflow-request-detail-modal/workflow-request-detail-modal.component';
import { PublishWorkflowModalComponent } from './workflow/publish-workflow-modal/publish-workflow-modal.component';
import { EditWorkflowModalComponent } from './workflow/edit-workflow-modal/edit-workflow-modal.component';

@NgModule({
  declarations: [BranchComponent, RoleComponent, UsersComponent, UserDetailModalComponent, CreateUserModalComponent, EditUserModalComponent, DeleteUserModalComponent, ApproveUserModalComponent, RejectUserModalComponent, UserRequestDetailModalComponent, WorkflowComponent, ApproveWorkflowModalComponent, RejectWorkflowModalComponent, WorkflowDetailModalComponent, CreateWorkflowModalComponent, WorkflowRequestDetailModalComponent, PublishWorkflowModalComponent, EditWorkflowModalComponent],
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
    ModalModule.forRoot(),
    CustomPaginationModule
  ]
})

export class SystemModule { }
