import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UIModule } from './ui/ui.module';
import { WidgetModule } from './widget/widget.module';
import { UpperNoSpaceDirective } from './directives/upper-nospace.directive';
import { BadgeComponent } from './components/badge/badge.component';

@NgModule({
  declarations: [
    UpperNoSpaceDirective,
    BadgeComponent,
  ],
  imports: [
    CommonModule,
    UIModule,
    WidgetModule
  ],
  exports: [
    UpperNoSpaceDirective,
    BadgeComponent,
  ]
})

export class SharedModule { }
