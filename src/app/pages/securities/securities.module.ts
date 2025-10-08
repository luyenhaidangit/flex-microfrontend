import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SecuritiesRoutingModule } from './securities-routing.module';
import { SecuritiesDomainListComponent } from './securities-domain/securities-domain-list.component';

@NgModule({
  declarations: [SecuritiesDomainListComponent],
  imports: [CommonModule, FormsModule, HttpClientModule, SecuritiesRoutingModule]
})
export class SecuritiesModule {}

