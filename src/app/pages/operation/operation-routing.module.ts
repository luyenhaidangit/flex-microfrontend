import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EndOfDayComponent } from './end-of-day/end-of-day.component';

const routes: Routes = [
  { path: 'end-of-day', component: EndOfDayComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OperationRoutingModule {}

