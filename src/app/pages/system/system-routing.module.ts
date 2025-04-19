import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DepartmentComponent } from './department/department.component';
import { BranchComponent } from './branch/branch.component';

const routes: Routes = [
    {
        path: 'branch',
        component: BranchComponent
    },
    {
        path: 'department',
        component: DepartmentComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SystemRoutingModule {}
