import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DepartmentComponent } from './department/department.component';
import { BranchComponent } from './branch/branch.component';
import { RoleComponent } from './role/role.component';

const routes: Routes = [
    {
        path: 'branch',
        component: BranchComponent
    },
    {
        path: 'department',
        component: DepartmentComponent
    },
    {
        path: 'role',
        component: RoleComponent
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
