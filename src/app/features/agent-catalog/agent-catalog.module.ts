import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

import { UIModule } from 'src/app/shared/ui/ui.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { PaginationModule } from 'src/app/core/components/pagination/pagination.module';

import { AgentCatalogRoutingModule } from './agent-catalog-routing.module';
import { AgentListComponent } from './components/agent-list/agent-list.component';
import { AgentFormModalComponent } from './components/agent-form-modal/agent-form-modal.component';
import { AgentDeleteConfirmModalComponent } from './components/agent-delete-confirm-modal/agent-delete-confirm-modal.component';
import { AgentCreateWizardComponent } from './components/agent-create-wizard/agent-create-wizard.component';

@NgModule({
  declarations: [AgentListComponent, AgentFormModalComponent, AgentDeleteConfirmModalComponent, AgentCreateWizardComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CKEditorModule, UIModule, SharedModule, PaginationModule, AgentCatalogRoutingModule],
  exports: [AgentCreateWizardComponent, AgentListComponent]
})
export class AgentCatalogModule {}
