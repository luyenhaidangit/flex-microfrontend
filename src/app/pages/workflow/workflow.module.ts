import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { WorkflowRoutingModule } from './workflow-routing.module';
import { UIModule } from '../../shared/ui/ui.module';
import { SharedModule } from '../../shared/shared.module';

import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule as CustomPaginationModule } from '../../core/components/pagination/pagination.module';

import { WorkflowComponent } from './workflow.component';
import { ApproveWorkflowModalComponent } from './approve-workflow-modal/approve-workflow-modal.component';
import { RejectWorkflowModalComponent } from './reject-workflow-modal/reject-workflow-modal.component';
import { WorkflowDetailModalComponent } from './workflow-detail-modal/workflow-detail-modal.component';
import { CreateWorkflowModalComponent } from './create-workflow-modal/create-workflow-modal.component';
import { WorkflowRequestDetailModalComponent } from './workflow-request-detail-modal/workflow-request-detail-modal.component';
import { PublishWorkflowModalComponent } from './publish-workflow-modal/publish-workflow-modal.component';
import { EditWorkflowModalComponent } from './edit-workflow-modal/edit-workflow-modal.component';

@NgModule({
  declarations: [
    WorkflowComponent,
    ApproveWorkflowModalComponent,
    RejectWorkflowModalComponent,
    WorkflowDetailModalComponent,
    CreateWorkflowModalComponent,
    WorkflowRequestDetailModalComponent,
    PublishWorkflowModalComponent,
    EditWorkflowModalComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    WorkflowRoutingModule,
    UIModule,
    SharedModule,
    TooltipModule.forRoot(),
    BsDropdownModule.forRoot(),
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    CustomPaginationModule
  ]
})
export class WorkflowModule { }

