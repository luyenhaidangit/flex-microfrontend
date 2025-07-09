import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { RoleService } from './role.service';
import { DEFAULT_PER_PAGE_OPTIONS } from 'src/app/core/constants/shared.constant';
import { ToastService } from 'angular-toastify';
import { AuthenticationService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss']
})

export class RoleComponent implements OnInit {
  breadCrumbItems = [
    { label: 'Quản trị hệ thống' },
    { label: 'Quản lý vai trò', active: true }
  ];

  items: any[] = [];
  selectedItem: any = null;
  modalRef?: BsModalRef;
  isLoading = false;

  pagingState = {
    pageIndex : 1,
    pageSize  : 10,
    totalPages: 0,
    totalItems: 0,
    keyword   : '',
    status    : '', // fix lỗi thiếu status
    createdDate: null // fix lỗi thiếu createdDate
  };

  DEFAULT_PER_PAGE_OPTIONS = DEFAULT_PER_PAGE_OPTIONS;

  roleForm!: FormGroup;
  submitted = false;

  @ViewChild('createModal') createTemplateRef!: TemplateRef<any>;
  @ViewChild('approveModal') approveTemplateRef!: TemplateRef<any>;
  @ViewChild('rejectModal') rejectTemplateRef!: TemplateRef<any>;
  @ViewChild('editModal') editTemplateRef!: TemplateRef<any>;
  @ViewChild('approveEditModal') approveEditTemplateRef!: TemplateRef<any>;
  @ViewChild('rejectEditModal') rejectEditTemplateRef!: TemplateRef<any>;
  @ViewChild('deleteModal') deleteTemplateRef!: TemplateRef<any>;
  @ViewChild('approveDeleteModal') approveDeleteTemplateRef!: TemplateRef<any>;
  @ViewChild('rejectDeleteModal') rejectDeleteTemplateRef!: TemplateRef<any>;
  @ViewChild('deleteDraftModal') deleteDraftModal!: TemplateRef<any>;
  rejectForm!: FormGroup;
  submittedReject = false;

  currentUser: any;
  showSubmitConfirm = false;
  rejectedReason: string | null = null;

  now: Date = new Date();

  // Tab navigation state
  activeTab: 'approved' | 'pending' = 'approved';
  pendingCount: number = 0;

  constructor(
    private roleService: RoleService,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.getItems();
    this.roleForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
      name: ['', [Validators.required]],
      description: ['']
    });
    this.rejectForm = this.fb.group({
      reason: ['', Validators.required]
    });
    this.loadCurrentUser();
  }

  switchTab(tab: 'approved' | 'pending') {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    // TODO: load data for the selected tab
    // if (tab === 'approved') this.getItems();
    // else this.getPendingRequests();
  }

  loadCurrentUser() {
    // Try to get from service, fallback to localStorage
    this.currentUser = this.authService.GetCurrentUser();
    if (!this.currentUser) {
      const token = this.authService.getAuthToken();
      if (token && token.user) {
        this.currentUser = token.user;
      } else {
        try {
          const userStr = localStorage.getItem('currentUser');
          if (userStr) this.currentUser = JSON.parse(userStr);
        } catch {}
      }
    }
  }

  get searchParams(): any {
    const { pageIndex, pageSize, keyword } = this.pagingState;
    return { pageIndex, pageSize, keyword };
  }

  getItems(): void {
    this.isLoading = true;
    this.roleService.getRoles(this.searchParams)
      .subscribe({
        next: (res) => {
          if (res?.isSuccess) {
            const { items, ...page } = res.data;
            this.items = items ?? [];
            Object.assign(this.pagingState, {
              pageIndex : page.pageIndex,
              pageSize  : page.pageSize,
              totalPages: page.totalPages,
              totalItems: page.totalItems
            });
          }
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  changePage(page: number): void {
    if (page < 1 || page > this.pagingState.totalPages || page === this.pagingState.pageIndex) return;
    this.pagingState.pageIndex = page;
    this.getItems();
  }

  changePageSize(): void {
    this.pagingState.pageIndex = 1;
    this.getItems();
  }

  openDetailModal(template: TemplateRef<any>, item: any): void {
    const code = item?.code;
    if (!code) {
      this.toastService.error('Không tìm thấy mã vai trò!');
      return;
    }
    this.roleService.getRoleDetail(code).subscribe({
      next: (res) => {
        this.selectedItem = res?.data || item;
        this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
      },
      error: () => {
        this.toastService.error('Không thể lấy thông tin chi tiết vai trò!');
        this.selectedItem = item;
        this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
      }
    });
  }

  openCreateModal(): void {
    this.submitted = false;
    this.roleForm.reset();
    this.rejectedReason = null;
    this.modalRef = this.modalService.show(this.createTemplateRef, { class: 'modal-lg' });
  }

  openApproveModal(item: any): void {
    this.selectedItem = item;
    this.modalRef = this.modalService.show(this.approveTemplateRef, { class: 'modal-lg' });
  }

  submitRoleForm(): void {
    this.submitted = true;
    if (this.roleForm.invalid) return;

    const payload = this.roleForm.value;
    this.roleService.createRole(payload).subscribe({
      next: () => {
        this.toastService.success('Tạo yêu cầu vai trò thành công!');
        this.modalRef?.hide();
        this.roleForm.reset();
        this.submitted = false;
        this.getItems();
      },
      error: (err) => {
        let errorMsg = 'Tạo yêu cầu thất bại!';
        const apiMsg = err?.error?.message?.toLowerCase();
        if (apiMsg?.includes('role code already exists')) {
          errorMsg = 'Mã vai trò đã tồn tại';
        }
        this.toastService.error(errorMsg);
        console.error('Tạo vai trò thất bại', err);
      }
    });
  }

  approveRole(): void {
    const code = this.selectedItem?.code;
    if (!code) return;
    this.roleService.approveRole(code).subscribe({
      next: () => {
        this.toastService.success('Phê duyệt yêu cầu thành công!');
        this.modalRef?.hide();
        this.getItems();
      },
      error: () => {
        this.toastService.error('Phê duyệt thất bại!');
      }
    });
  }

  openRejectModal(item: any): void {
    this.selectedItem = item;
    this.submittedReject = false;
    this.rejectForm.reset();
    this.modalRef = this.modalService.show(this.rejectTemplateRef, { class: 'modal-md' });
  }

  confirmRejectRole(): void {
    this.submittedReject = true;
    if (this.rejectForm.invalid) return;
    const code = this.selectedItem?.code;
    if (!code) return;
    this.roleService.rejectRole(code, this.rejectForm.value.reason).subscribe({
      next: () => {
        this.toastService.success('Đã từ chối yêu cầu thành công!');
        this.modalRef?.hide();
        this.getItems();
      },
      error: () => {
        this.toastService.error('Từ chối yêu cầu thất bại!');
      }
    });
  }

  openEditModal(item: any): void {
    this.selectedItem = item;
    this.roleForm.patchValue({
      code: item.code,
      name: item.name,
      description: item.description
    });
    this.rejectedReason = item.status === 'Rejected' ? item.rejectReason : null;
    this.modalRef = this.modalService.show(this.editTemplateRef, { class: 'modal-lg' });
  }

  submitEditRoleForm(): void {
    this.submitted = true;
    if (this.roleForm.invalid || !this.selectedItem) return;
    const payload = {
      code: this.roleForm.value.code,
      name: this.roleForm.value.name,
      description: this.roleForm.value.description,
    };
    this.roleService.updateRole(this.selectedItem.code, payload).subscribe({
      next: () => {
        this.toastService.success('Cập nhật vai trò thành công!');
        this.modalRef?.hide();
        this.getItems();
      },
      error: () => {
        this.toastService.error('Cập nhật vai trò thất bại!');
      }
    });
  }

  openDeleteModal(item: any): void {
    this.selectedItem = item;
    this.modalRef = this.modalService.show(this.deleteTemplateRef, { class: 'modal-md' });
  }

  confirmDeleteRole(): void {
    if (!this.selectedItem?.code) return;
    this.roleService.deleteRole(this.selectedItem.code).subscribe({
      next: () => {
        this.toastService.success('Đã gửi yêu cầu xóa thành công!');
        this.modalRef?.hide();
        this.getItems();
      },
      error: () => {
        this.toastService.error('Gửi yêu cầu xóa thất bại!');
      }
    });
  }

  saveDraftRole(): void {
    this.submitted = true;
    if (this.roleForm.invalid) return;
    const payload = {
      code: this.roleForm.value.code,
      name: this.roleForm.value.name,
      description: this.roleForm.value.description,
      status: 'Draft'
    };
    this.roleService.saveDraftRole(payload).subscribe({
      next: () => {
        this.toastService.success('Lưu nháp vai trò thành công!');
        this.modalRef?.hide();
        this.roleForm.reset();
        this.submitted = false;
        this.getItems();
      },
      error: () => {
        this.toastService.error('Lưu nháp thất bại!');
      }
    });
  }

  openSubmitConfirm(): void {
    this.showSubmitConfirm = true;
  }
  closeSubmitConfirm(): void {
    this.showSubmitConfirm = false;
  }
  submitRoleForApproval(): void {
    this.submitted = true;
    if (this.roleForm.invalid) return;
    const payload = {
      ...this.roleForm.value,
      status: 'Pending',
      requestedBy: this.currentUser?.username || 'UNKNOWN',
      requestedDate: new Date()
    };
    this.roleService.createRole(payload).subscribe({
      next: () => {
        this.toastService.success('Gửi yêu cầu phê duyệt thành công!');
        this.modalRef?.hide();
        this.roleForm.reset();
        this.submitted = false;
        this.getItems();
        this.showSubmitConfirm = false;
      },
      error: (err) => {
        let errorMsg = 'Gửi yêu cầu thất bại!';
        const apiMsg = err?.error?.message?.toLowerCase();
        if (apiMsg?.includes('role code already exists')) {
          errorMsg = 'Mã vai trò đã tồn tại';
        }
        this.toastService.error(errorMsg);
        this.showSubmitConfirm = false;
      }
    });
  }

  // Hàm xử lý input: upperCase và loại bỏ dấu cách, có thể tái sử dụng cho các input khác
  onInputUpperNoSpace(controlName: string, event: any) {
    const value = event.target.value.toUpperCase().replace(/\s+/g, '');
    this.roleForm.get(controlName)?.setValue(value, { emitEvent: false });
  }

  statusLabel(status: string): string {
    switch ((status || '').toUpperCase()) {
      case 'DRF': return 'Nháp';
      case 'UNA': return 'Chờ duyệt';
      case 'AUT': return 'Đã duyệt';
      case 'REJ': return 'Từ chối';
      default: return status;
    }
  }

  getStatusBadgeClass(status: string): string {
    const s = (status || '').toUpperCase();
    if (s === 'DRF') return 'badge badge-soft-secondary';
    if (s === 'UNA') return 'badge badge-soft-warning';
    if (s === 'AUT') return 'badge badge-soft-success';
    if (s === 'REJ') return 'badge badge-soft-danger';
    return 'badge badge-soft-light';
  }

  getStatusLabel(status: string): string {
    const s = (status || '').toUpperCase();
    if (s === 'DRF') return 'Nháp';
    if (s === 'UNA') return 'Chờ duyệt';
    if (s === 'AUT') return 'Đã duyệt';
    if (s === 'REJ') return 'Từ chối';
    return status;
  }

  openDeleteDraftModal(): void {
    this.modalRef = this.modalService.show(this.deleteDraftModal, { class: 'modal-md' });
  }

  confirmDeleteDraft(): void {
    // TODO: Implement draft deletion logic
    this.toastService.info('Chức năng xoá nháp đang được phát triển.');
    this.modalRef?.hide();
  }
}
