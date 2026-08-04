import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UIModule } from 'src/app/shared/ui/ui.module';
import { SharedModule } from 'src/app/shared/shared.module';

import { AgentCatalogRoutingModule } from './agent-catalog-routing.module';
import { AgentListComponent } from './components/agent-list/agent-list.component';
import { AgentFormModalComponent } from './components/agent-form-modal/agent-form-modal.component';
import { AgentDeleteConfirmModalComponent } from './components/agent-delete-confirm-modal/agent-delete-confirm-modal.component';

@NgModule({
  declarations: [AgentListComponent, AgentFormModalComponent, AgentDeleteConfirmModalComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, UIModule, SharedModule, AgentCatalogRoutingModule]
})
export class AgentCatalogModule {}
