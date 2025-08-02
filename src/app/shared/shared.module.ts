import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UIModule } from './ui/ui.module';
import { WidgetModule } from './widget/widget.module';
import { UpperNoSpaceDirective } from './directives/upper-nospace.directive';
import { BadgeComponent } from './components/badge/badge.component';
import { SafeFieldPipe } from './pipes/safe-field.pipe';
import { PrettyJsonPipe } from './pipes/pretty-json.pipe';

@NgModule({
  declarations: [
    UpperNoSpaceDirective,
    BadgeComponent,
    SafeFieldPipe,
    PrettyJsonPipe,
  ],
  imports: [
    CommonModule,
    UIModule,
    WidgetModule
  ],
  exports: [
    UpperNoSpaceDirective,
    BadgeComponent,
    SafeFieldPipe,
    PrettyJsonPipe,
  ]
})

export class SharedModule { }
