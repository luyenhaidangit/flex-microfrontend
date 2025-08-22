import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TabsModule } from 'ngx-bootstrap/tabs';

import { PagetitleComponent } from './pagetitle/pagetitle.component';
import { LoaderComponent } from './loader/loader.component';
import { LoadingComponent } from './loading/loading.component';
import { SkeletonComponent } from './skeleton/skeleton.component';
import { TabsComponent } from './tab/tabs.component';

@NgModule({
  declarations: [PagetitleComponent,  LoaderComponent, LoadingComponent, SkeletonComponent, TabsComponent],
  imports: [
    CommonModule,
    FormsModule,
    BsDatepickerModule.forRoot(),
    TimepickerModule.forRoot(),
    BsDropdownModule.forRoot(),
    TabsModule.forRoot()
  ],
  exports: [PagetitleComponent, LoaderComponent, LoadingComponent, SkeletonComponent, TabsComponent]
})
export class UIModule { }
