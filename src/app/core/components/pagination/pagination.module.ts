import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PaginationComponent } from './pagination/pagination.component';
import { PageNumbersComponent } from './page-numbers/page-numbers.component';
import { PageSizeSelectorComponent } from './page-size-selector/page-size-selector.component';

@NgModule({
  declarations: [
    PaginationComponent,
    PageNumbersComponent,
    PageSizeSelectorComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    PaginationComponent,
    PageNumbersComponent,
    PageSizeSelectorComponent
  ]
})
export class PaginationModule { }
