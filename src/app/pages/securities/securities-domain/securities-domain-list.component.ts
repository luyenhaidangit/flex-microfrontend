import { Component, OnInit } from '@angular/core';
import { SecuritiesDomainService, SecuritiesDomainDto } from './securities-domain.service';

@Component({
  selector: 'app-securities-domain-list',
  templateUrl: './securities-domain-list.component.html',
  styleUrls: ['./securities-domain-list.component.scss']
})
export class SecuritiesDomainListComponent implements OnInit {
  loading = false;
  rows: SecuritiesDomainDto[] = [];
  error?: string;

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

  trackByCode(index: number, item: SecuritiesDomainDto) {
    return item.domainCode || index;
  }
}
