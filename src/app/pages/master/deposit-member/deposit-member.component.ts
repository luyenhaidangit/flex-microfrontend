import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { DepositMemberItem, DepositMemberSearchParams } from './deposit-member.models';
import { DepositMemberService } from './deposit-member.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

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
    fullName: '',
    bicCode: ''
  };

  // Pagination state (compatible with app-pagination)
  paging = {
    index: 1,
    size: 10,
    totalItems: 0,
    totalPages: 0
  };

  // Sorting state
  sort: { column: 'depositCode' | 'shortName' | 'fullName' | 'bicCode' | null; direction: 'asc' | 'desc' | null } = {
    column: null,
    direction: null
  };

  // Table skeleton
  skeleton = {
    rows: 8,
    columns: ['140px', '200px', '320px', '160px']
  };

  // Import modal state
  @ViewChild('importModal') importModal!: TemplateRef<any>;
  modalRef?: BsModalRef;
  importForm: { file?: File; effectiveDate?: string } = {};
  uploading = false;
  importError?: string;

  constructor(private service: DepositMemberService, private modalService: BsModalService) {}

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

  onSort(column: 'depositCode' | 'shortName' | 'fullName' | 'bicCode'): void {
    if (this.sort.column === column) {
      this.sort.direction = this.sort.direction === 'asc' ? 'desc' : (this.sort.direction === 'desc' ? null : 'asc');
      if (!this.sort.direction) {
        this.sort.column = null;
      }
    } else {
      this.sort.column = column;
      this.sort.direction = 'asc';
    }
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
      bicCode: this.filter.bicCode?.trim() || undefined,
      sortColumn: this.sort.column || undefined,
      sortDirection: this.sort.direction || undefined,
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

  // Info moved to app-page-title via template

  // ==== Import handling ====
  openImportModal(): void {
    this.importForm = {};
    this.importError = undefined;
    this.uploading = false;
    this.modalRef = this.modalService.show(this.importModal, { class: 'modal-md' });
  }

  closeImportModal(): void {
    this.modalRef?.hide();
    this.modalRef = undefined;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length ? input.files[0] : undefined;
    this.importForm.file = file || undefined;
  }

  submitImport(): void {
    if (!this.importForm.file || !this.importForm.effectiveDate) {
      this.importError = 'Vui lòng chọn tệp và ngày hiệu lực';
      return;
    }
    const form = new FormData();
    // ASP.NET Core model binder is case-insensitive; use property names for clarity
    form.append('File', this.importForm.file);
    form.append('EffectiveDate', this.importForm.effectiveDate);

    this.uploading = true;
    this.importError = undefined;
    this.service.importDepositMembers(form).subscribe({
      next: () => {
        this.uploading = false;
        this.closeImportModal();
        // Reload list after successful import
        this.onSearch();
      },
      error: (err) => {
        this.uploading = false;
        this.importError = err?.error?.message || 'Tải lên thất bại';
      }
    });
  }
}
