import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PublishRoutingModule } from './publish-routing.module';
import { PublishComponent } from './publish.component';

@NgModule({
  declarations: [PublishComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PublishRoutingModule
  ]
})
export class PublishModule { }
