import { Component, OnInit } from '@angular/core';
import { SecuritiesDomainService } from './securities-domain.service';
import { SECURITIES_DOMAIN_CONFIG } from './securities-domain.config';
import { mapSettleMethodLabel, mapYesNo } from './securities-domain.helper';
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
  mapYesNo = mapYesNo;
  showInfo = false;

  // Filters
  filter = {
    domainCode: '',
    domainName: '',
    isDefault: '' as '' | 'true' | 'false'
  };

  // Pagination state
  paging = {
    index: 1,
    size: 10,
    totalItems: 0,
    totalPages: 0
  };

  // Sorting state
  sort: { column: SecuritiesDomainSearchParams['sortColumn'] | null; direction: 'asc' | 'desc' | null } = {
    column: null,
    direction: null
  };

  constructor(private service: SecuritiesDomainService) {}

  ngOnInit(): void { this.load(); }

  getPaginationState() { return { ...this.paging }; }

  onPageChange(page: number): void {
    if (page < 1 || (this.paging.totalPages && page > this.paging.totalPages) || page === this.paging.index) return;
    this.paging.index = page; this.load();
  }

  onPageSizeChange(size: number): void {
    if (size === this.paging.size) return;
    this.paging.size = size; this.paging.index = 1; this.load();
  }

  onSearch(): void { this.paging.index = 1; this.load(); }

  onSort(column: NonNullable<SecuritiesDomainSearchParams['sortColumn']>): void {
    if (this.sort.column === column) {
      this.sort.direction = this.sort.direction === 'asc' ? 'desc' : (this.sort.direction === 'desc' ? null : 'asc');
      if (!this.sort.direction) this.sort.column = null;
    } else {
      this.sort.column = column; this.sort.direction = 'asc';
    }
    this.paging.index = 1; this.load();
  }

  private load(): void {
    const params: SecuritiesDomainSearchParams = {
      pageIndex: this.paging.index,
      pageSize: this.paging.size,
      domainCode: this.filter.domainCode?.trim() || undefined,
      domainName: this.filter.domainName?.trim() || undefined,
      isDefault: this.filter.isDefault === '' ? undefined : this.filter.isDefault === 'true',
      sortColumn: this.sort.column || undefined,
      sortDirection: this.sort.direction || undefined,
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
  openInfo() { this.showInfo = true; }
  closeInfo() { this.showInfo = false; }
}

