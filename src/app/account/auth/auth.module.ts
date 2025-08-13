import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AlertModule } from 'ngx-bootstrap/alert';
import { CarouselModule } from 'ngx-owl-carousel-o';

import { UIModule } from '../../shared/ui/ui.module';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { Register2Component } from './register2/register2.component';
import { Recoverpwd2Component } from './recoverpwd2/recoverpwd2.component';

import { AuthRoutingModule } from './auth-routing.module';
import { PasswordresetComponent } from './passwordreset/passwordreset.component';

@NgModule({
  declarations: [LoginComponent, SignupComponent, PasswordresetComponent, Register2Component, Recoverpwd2Component],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AlertModule.forRoot(),
    UIModule,
    AuthRoutingModule,
    CarouselModule
  ]
})
export class AuthModule { }
