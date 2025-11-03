import { Component, OnInit } from '@angular/core';
import { SecuritiesDomainService } from './securities-domain.service';
import { SECURITIES_DOMAIN_CONFIG } from './securities-domain.config';
import { mapSettleMethodLabel } from './securities-domain.helper';
import { SecuritiesDomainItem, SecuritiesDomainSearchParams } from './securities-domain.models';

@Component({
  selector: 'app-securities-domain-list',
  styleUrls: ['./securities-domain-list.component.scss'],
  templateUrl: './securities-domain-list.component.html'
})
export class SecuritiesDomainListComponent implements OnInit {
  // UI state
  loading = false;
  rows: SecuritiesDomainItem[] = [];
  error?: string;
  CONFIG = SECURITIES_DOMAIN_CONFIG;
  mapSettleMethodLabel = mapSettleMethodLabel;

  // Filters
  filter = {
    domainCode: '',
    domainName: ''
  };

  // Pagination state
  paging = {
    index: 1,
    size: 10,
    totalItems: 0,
    totalPages: 0
  };

  // No sorting (backend removed ordering)

  constructor(private service: SecuritiesDomainService) {}

  ngOnInit(): void { this.load(); }

  onPageChange(page: number): void {
    if (page < 1 || (this.paging.totalPages && page > this.paging.totalPages) || page === this.paging.index) return;
    this.paging.index = page; this.load();
  }

  onSearch(): void { this.paging.index = 1; this.load(); }

  private load(): void {
    const params: SecuritiesDomainSearchParams = {
      pageIndex: this.paging.index,
      pageSize: this.paging.size,
      domainCode: this.filter.domainCode?.trim() || undefined,
      domainName: this.filter.domainName?.trim() || undefined,
    };

    this.loading = true; this.error = undefined;
    this.service.getPaging(params).subscribe({
      next: (res) => {
        const page = res?.data as any;
        this.rows = page?.items ?? [];
        this.paging.totalItems = page?.totalItems ?? 0;
        this.paging.totalPages = page?.totalPages ?? 0;
        this.paging.index = page?.pageIndex ?? this.paging.index;
        this.paging.size = page?.pageSize ?? this.paging.size;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Không tải được dữ liệu';
        this.loading = false;
      }
    });
  }

  trackByCode(index: number, item: any) { return item.domainCode || index; }
}
