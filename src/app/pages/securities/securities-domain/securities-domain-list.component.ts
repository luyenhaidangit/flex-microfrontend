import { Component, OnInit } from '@angular/core';
import { SecuritiesDomainService } from './securities-domain.service';
import { SECURITIES_DOMAIN_CONFIG } from './securities-domain.config';
import { mapSettleMethodLabel, mapYesNo } from './securities-domain.helper';

@Component({
  selector: 'app-securities-domain-list',
  styleUrls: ['./securities-domain-list.component.scss'],
  templateUrl: './securities-domain-list.component.html'
})
export class SecuritiesDomainListComponent implements OnInit {
  loading = false;
  rows: any[] = [];
  error?: string;
  CONFIG = SECURITIES_DOMAIN_CONFIG;
  mapSettleMethodLabel = mapSettleMethodLabel;
  mapYesNo = mapYesNo;

  constructor(private service: SecuritiesDomainService) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch() {
    this.loading = true;
    this.error = undefined;
    this.service.getDomains().subscribe({
      next: (res) => {
        this.rows = res?.data || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Không tải được dữ liệu';
        this.loading = false;
      }
    });
  }

  trackByCode(index: number, item: any) {
    return item.domainCode || index;
  }
}
