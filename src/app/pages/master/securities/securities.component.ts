import { Component, OnInit } from '@angular/core';
import { SecuritiesService } from './securities.service';
import { SECURITIES_CONFIG } from './securities.config';
import { SecuritiesItem, SecuritiesSearchParams } from './securities.models';

@Component({
  selector: 'app-securities',
  templateUrl: './securities.component.html',
  styleUrls: ['./securities.component.scss']
})
export class SecuritiesComponent implements OnInit {
  // UI state
  loading = false;
  rows: SecuritiesItem[] = [];
  error?: string;
  CONFIG = SECURITIES_CONFIG;

  // Filters
  filter = {
    securitiesCode: '',
    issuerCode: '',
    domainCode: '',
    symbol: '',
    isinCode: ''
  };

  // Pagination state
  paging = {
    index: 1,
    size: 10,
    totalItems: 0,
    totalPages: 0
  };

  constructor(private service: SecuritiesService) {}

  ngOnInit(): void { 
    this.load(); 
  }

  getPaginationState() { 
    return { ...this.paging }; 
  }

  onPageChange(page: number): void {
    if (page < 1 || (this.paging.totalPages && page > this.paging.totalPages) || page === this.paging.index) return;
    this.paging.index = page; 
    this.load();
  }

  onPageSizeChange(size: number): void {
    if (size === this.paging.size) return;
    this.paging.size = size; 
    this.paging.index = 1; 
    this.load();
  }

  onSearch(): void { 
    this.paging.index = 1; 
    this.load(); 
  }

  private load(): void {
    const params: SecuritiesSearchParams = {
      pageIndex: this.paging.index,
      pageSize: this.paging.size,
      securitiesCode: this.filter.securitiesCode?.trim() || undefined,
      issuerCode: this.filter.issuerCode?.trim() || undefined,
      domainCode: this.filter.domainCode?.trim() || undefined,
      symbol: this.filter.symbol?.trim() || undefined,
      isinCode: this.filter.isinCode?.trim() || undefined,
    };

    this.loading = true; 
    this.error = undefined;
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

  trackByCode(index: number, item: any) { 
    return item.securitiesCode || index; 
  }
}
