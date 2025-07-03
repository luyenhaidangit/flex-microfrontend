import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UIModule } from './ui/ui.module';

import { WidgetModule } from './widget/widget.module';
import { UpperNoSpaceDirective } from './directives/upper-nospace.directive';

@NgModule({
  declarations: [UpperNoSpaceDirective],
  imports: [
    CommonModule,
    UIModule,
    WidgetModule
  ],
  exports: [UpperNoSpaceDirective]
})

export class SharedModule { }
