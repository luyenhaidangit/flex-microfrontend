import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EndOfDayPageComponent } from './end-of-day/end-of-day.page.component';

const routes: Routes = [
  { path: 'end-of-day', component: EndOfDayPageComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OperationRoutingModule {}
