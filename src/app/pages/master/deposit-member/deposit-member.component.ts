import { Component, OnInit } from '@angular/core';
import { DepositMemberItem, DepositMemberSearchParams } from './deposit-member.models';
import { DepositMemberService } from './deposit-member.service';

@Component({
  selector: 'app-deposit-member-list',
  templateUrl: './deposit-member.component.html',
  styleUrls: ['./deposit-member.component.scss']
})
export class DepositMemberComponent implements OnInit {
  // Breadcrumb
  breadCrumbItems = [
    { label: 'Danh mục cơ sở' },
    { label: 'Thành viên lưu ký', active: true }
  ];

  // UI state
  loading = false;
  items: DepositMemberItem[] = [];
  error?: string;

  // Filters
  filter = {
    depositCode: '',
    shortName: '',
    fullName: ''
  };

  // Pagination state (compatible with app-pagination)
  paging = {
    index: 1,
    size: 10,
    totalItems: 0,
    totalPages: 0
  };

  // Table skeleton
  skeleton = {
    rows: 8,
    columns: ['140px', '200px', '320px', '160px', '120px']
  };

  constructor(private service: DepositMemberService) {}

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
    const params: DepositMemberSearchParams = {
      pageIndex: this.paging.index,
      pageSize: this.paging.size,
      depositCode: this.filter.depositCode?.trim() || undefined,
      shortName: this.filter.shortName?.trim() || undefined,
      fullName: this.filter.fullName?.trim() || undefined,
    };

    this.loading = true;
    this.error = undefined;
    this.service.getPaging(params).subscribe({
      next: (res) => {
        const page = res?.data || undefined as any;
        this.items = page?.items ?? [];
        this.paging.totalItems = page?.totalItems ?? 0;
        this.paging.totalPages = page?.totalPages ?? 0;
        this.loading = false;
      },
      error: (err) => {
        this.items = [];
        this.paging.totalItems = 0;
        this.paging.totalPages = 0;
        this.error = err?.error?.message || 'Không tải được dữ liệu';
        this.loading = false;
      }
    });
  }

  // Action handlers (placeholder)
  onView(item: DepositMemberItem): void {
    // TODO: Hook up detail modal
    console.log('View deposit member', item);
  }

  onEdit(item: DepositMemberItem): void {
    // TODO: Hook up edit modal
    console.log('Edit deposit member', item);
  }

  onDelete(item: DepositMemberItem): void {
    // TODO: Hook up delete confirmation
    console.log('Delete deposit member', item);
  }
}
