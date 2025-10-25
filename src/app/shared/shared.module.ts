import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UIModule } from './ui/ui.module';
import { WidgetModule } from './widget/widget.module';
import { UpperNoSpaceDirective } from './directives/upper-nospace.directive';
import { UpperNoAccentDirective } from './directives/upper-noaccent.directive';
import { BadgeComponent } from './ui/badge/badge.component';
import { SafeFieldPipe } from './pipes/safe-field.pipe';
import { PrettyJsonPipe } from './pipes/pretty-json.pipe';

@NgModule({
  declarations: [
    UpperNoSpaceDirective,
    UpperNoAccentDirective,
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
    UpperNoAccentDirective,
    BadgeComponent,
    SafeFieldPipe,
    PrettyJsonPipe,
  ],
  providers: [
  ]
})
export class SharedModule { }
