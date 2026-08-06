import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgentListComponent } from './components/agent-list/agent-list.component';
import { AgentCreateWizardComponent } from './components/agent-create-wizard/agent-create-wizard.component';

const routes: Routes = [
  { path: '', component: AgentListComponent },
  { path: 'create', component: AgentCreateWizardComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgentCatalogRoutingModule {}
