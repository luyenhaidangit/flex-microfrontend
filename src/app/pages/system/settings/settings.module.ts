import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { SettingsRoutingModule } from './settings-routing.module';
import { UIModule } from '../../../shared/ui/ui.module';
import { SharedModule } from '../../../shared/shared.module';

// Components
import { SettingsComponent } from './settings.component';
import { AuthenticationComponent } from './authentication/authentication.component';

// Third-party modules
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [
    SettingsComponent,
    AuthenticationComponent
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    UIModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    })
  ]
})
export class SettingsModule { }
