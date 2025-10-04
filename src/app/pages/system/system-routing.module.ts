import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BranchComponent } from './branch/branch.component';
import { RoleComponent } from './role/role.component';
import { UsersComponent } from './user/user.component';
import { WorkflowComponent } from './workflow/workflow.component';

const routes: Routes = [
    {
        path: 'branch',
        component: BranchComponent
    },
    {
        path: 'role',
        component: RoleComponent
    },
    {
        path: 'user',
        component: UsersComponent
    },
    {
        path: 'workflow',
        component: WorkflowComponent
    },
    {
        path: 'settings',
        loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule)
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SystemRoutingModule {}
