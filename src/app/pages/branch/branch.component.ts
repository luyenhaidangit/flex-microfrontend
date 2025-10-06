import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { BranchService } from './branch.service';
import { DEFAULT_PER_PAGE_OPTIONS } from 'src/app/core/constants/shared.constant';
import { ToastService } from 'angular-toastify';
import { Branch, PagingState, RequestDetailData, BranchSearchParams } from './branch.models';
import { finalize } from 'rxjs/operators';
import { getBranchTypeLabel } from './branch.helper';
import { BRANCH_CONFIG } from './branch.config';
import { EntityListComponent } from 'src/app/core/components/base/entity-list.component';

@Component({
  selector: 'app-branch',
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.scss']
})
export class BranchComponent extends EntityListComponent<any> implements OnInit {
  
  // Config base
  CONFIG = BRANCH_CONFIG;

  @ViewChild('detailModal') detailModalTemplateRef!: TemplateRef<any>;
  @ViewChild('createModal') createTemplateRef!: TemplateRef<any>;
  @ViewChild('editModal') editTemplateRef!: TemplateRef<any>;
  @ViewChild('deleteModal') deleteTemplateRef!: TemplateRef<any>;

  branchForm!: FormGroup;
  deleteForm!: FormGroup;

  pendingItems: Branch[] = [];

  pagingState: PagingState = {
    pageIndex : 1,
    pageSize  : 10,
    totalPages: 0,
    totalItems: 0,
    keyword   : '',
    isActive  : null,
    type: null
  };

  @ViewChild('approveModal') approveTemplateRef!: TemplateRef<any>;
  @ViewChild('rejectModal') rejectTemplateRef!: TemplateRef<any>;
  @ViewChild('approveEditModal') approveEditTemplateRef!: TemplateRef<any>;
  @ViewChild('rejectEditModal') rejectEditTemplateRef!: TemplateRef<any>;
  @ViewChild('approveDeleteModal') approveDeleteTemplateRef!: TemplateRef<any>;
  @ViewChild('rejectDeleteModal') rejectDeleteTemplateRef!: TemplateRef<any>;
  @ViewChild('deleteDraftModal') deleteDraftModal!: TemplateRef<any>;
  @ViewChild('requestDetailModal') requestDetailTemplateRef!: TemplateRef<any>;
  rejectForm!: FormGroup;

  // Prepare component: reuse base loading flag
  get isLoadingList() { return this.loadingTable; }
  isLoadingHistory = false;
  modalRef?: BsModalRef | null = null;
  isSubmitting: boolean = false;

  // items and selectedItem are provided by EntityListComponent
  changeHistory: any[] = [];

  showSubmitConfirm = false;
  rejectedReason: string | null = null;

  // Tab navigation state
  activeTab: 'approved' | 'pending' = 'approved';

  // Enhanced detail modal properties
  requestDetailData: RequestDetailData | null = null;
  
  // Branch type options for selects
  branchTypes: number[] = [1, 2, 3];
  
  // Loading states for approve/reject actions
  isApproving = false;
  isRejecting = false;

  skeletonRows = Array.from({ length: 8 });
  tableConfig = {
    approved: {
      head: ['Mã chi nhánh', 'Tên chi nhánh', 'Loại chi nhánh', 'Mô tả', 'Trạng thái', 'Thao tác'],
      skeletonCols: ['60px', '140px', '100px', '200px', '80px', '120px']
    },
    pending: {
      head: ['Mã chi nhánh', 'Tên chi nhánh', 'Mô tả', 'Loại yêu cầu', 'Người tạo', 'Ngày tạo', 'Thao tác'],
      skeletonCols: ['60px', '140px', '200px', '90px', '120px', '90px', '120px']
    }
  };

  get headCols(): string[] {
    return this.tableConfig[this.activeTab].head;
  }
  get skeletonCols(): string[] {
    return this.tableConfig[this.activeTab].skeletonCols;
  }
  get colspan(): number {
    return this.headCols.length;
  }

  // Helper methods
  public getBranchTypeLabel = getBranchTypeLabel;

  trackByCode(_: number, item: Branch) { return item.code; }
  trackById(_: number, item: any)    { return item.requestId ?? item.id; }

  constructor(
    private branchService: BranchService,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {
    super({} as any);
  }

  ngOnInit(): void {
    // Initial load using base helper
    this.onSearch();

    // Initialize forms
    this.branchForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      branchType: [1, [Validators.required]],
      description: ['', [Validators.maxLength(500)]],

      isActive: [true, [Validators.required]],
      comment: ['', [Validators.maxLength(500)]]
    });

    this.deleteForm = this.fb.group({
      comment: ['', [Validators.maxLength(500)]]
    });

    this.rejectForm = this.fb.group({
      reason: ['', [Validators.required]]
    });
    
    // Override toast icon size with JavaScript
    this.overrideToastIconSize();
  }

  // Handle search all items
  get searchParams(): BranchSearchParams {
    const { pageIndex, pageSize, keyword, isActive } = this.pagingState;
    const params: BranchSearchParams = { pageIndex, pageSize };
    if (keyword?.trim()) params.keyword = keyword.trim();
    if (isActive === true) params.isActive = 'Y';
    else if (isActive === false) params.isActive = 'N';
    return params;
  }

  // Handle search for pending items (with requestType filter)
  get pendingSearchParams(): BranchSearchParams {
    const { pageIndex, pageSize, keyword, type } = this.pagingState;
    const params: BranchSearchParams = { pageIndex, pageSize };
    if (keyword?.trim()) params.keyword = keyword.trim();
    if (type) params.type = type;
    return params;
  }

  public updatePagingState(page: Partial<PagingState>) {
    Object.assign(this.pagingState, {
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      totalPages: page.totalPages,
      totalItems: page.totalItems
    });
  }

  // Implement abstract onSearch using base loader
  onSearch(): void {
    if (this.activeTab === 'approved') {
      const params = { ...this.searchParams };
      this.loadData<Branch>(this.branchService.getApprovedBranches(params));
    } else {
      const params = { ...this.pendingSearchParams };
      // Keep pendingItems in sync for template, while leveraging base items
      this.loadingTable = true;
      this.branchService.getPendingBranches(params)
        .pipe(finalize(() => this.loadingTable = false))
        .subscribe({
          next: (res) => {
            if (res?.isSuccess) {
              const { items, totalItems, totalPages } = res.data || {};
              this.items = items ?? [];
              this.pendingItems = items ?? [];
              this.updatePagingState({ totalItems, totalPages });
            } else {
              this.items = [];
              this.pendingItems = [];
            }
          },
          error: () => {
            this.items = [];
            this.pendingItems = [];
          }
        });
    }
  }

  // onSearch now handled above

  // Handle view detail item
  openDetailModal(item: any): void {
    if (this.activeTab === 'approved') {
      const code = item?.code;
      if (!code) {
        this.toastService.error('Không tìm thấy mã chi nhánh!');
        return;
      }
      this.selectedItem = null;
      this.branchService.getApprovedBranchByCode(code).subscribe({
        next: (res) => {
          this.selectedItem = res?.data || item;
          
          // Reset change history when opening modal
          this.changeHistory = [];
          
          this.modalRef = this.modalService.show(this.detailModalTemplateRef, { 
            class: 'modal-xl',
            backdrop: 'static',
            keyboard: false, 
          });
        }
      });
    } else {
      // pending tab: show request detail modal
      const requestId = item?.requestId || item?.id;
      if (!requestId) {
        this.toastService.error('Không tìm thấy ID yêu cầu!');
        return;
      }
      this.requestDetailData = null;
      this.selectedItem = item;
      this.isApproving = false;
      this.isRejecting = false;
      this.branchService.getBranchRequestDetail(requestId).subscribe({
        next: (res) => {
          if (res?.isSuccess) {
            this.requestDetailData = res.data;
            this.modalRef = this.modalService.show(this.requestDetailTemplateRef, {
              class: 'modal-xl',
              backdrop: 'static',
              keyboard: false,
              ignoreBackdropClick: true
            });
            this.modalRef.onHidden?.subscribe(() => {
              this.resetLoadingStates();
            });
          } else {
            this.toastService.error('Không thể lấy thông tin chi tiết yêu cầu!');
          }
        }
      });
    }
  }

  // Load change history when history tab is opened
  loadChangeHistory(): void {
    if (!this.selectedItem?.code) {
      this.toastService.error('Không tìm thấy mã chi nhánh!');
      return;
    }

    // Only load if not already loaded
    if (this.changeHistory.length > 0) {
      return;
    }

    this.isLoadingHistory = true;
    this.branchService.getBranchChangeHistory(this.selectedItem.code)
      .pipe(finalize(() => this.isLoadingHistory = false))
      .subscribe({
        next: (res) => {
          if (res?.isSuccess) {
            // Use the API response directly without transformation
            this.changeHistory = res.data || [];
          } else {
            this.changeHistory = [];
            this.toastService.error('Không thể lấy lịch sử thay đổi!');
          }
        }
      });
  }

  // Open create modal
  openCreateModal(): void {
    this.branchForm.reset();
    this.branchForm.patchValue({
      isActive: true,
      branchType: 1,
      comment: ''
    });
    this.rejectedReason = null;
    this.openModal(this.createTemplateRef, { class: 'modal-xl' });
  }

  // Submit create branch
  onSubmitBranch(): void {
    this.branchForm.markAllAsTouched();
    if (this.branchForm.invalid) return;
    this.isSubmitting = true;
    const formValue = this.branchForm.value;
    const payload = {
      code: formValue.code,
      name: formValue.name,
      description: formValue.description,
      branchType: Number(formValue.branchType),
      isActive: !!formValue.isActive
    };
    this.branchService.createBranch(payload)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: () => {
          this.toastService.success('Gửi duyệt thành công!');
          this.branchForm.reset();
          this.modalRef?.hide();
          this.onSearch();
        },
        error: (err) => {
          this.handleError(err, 'Gửi duyệt thất bại!');
        }
      });
  }

  // Open edit modal
  openEditModal(item: Branch): void {
    this.selectedItem = item;
    this.branchForm.patchValue({
      code: item.code,
      name: item.name,
      branchType: (item.branchType !== undefined && item.branchType !== null)
        ? Number(item.branchType)
        : '',
      description: item.description || '',
      isActive: item.isActive === 'Y' || item.isActive === true
    });
    this.openModal(this.editTemplateRef, {
      class: 'modal-xl',
      backdrop: 'static',
      keyboard: false
    });
  }

  // Submit edit branch form
  submitEditBranchForm(): void {
    this.branchForm.markAllAsTouched();
    if (this.branchForm.invalid || !this.selectedItem) return;
  
    const formData = this.branchForm.value;
    
    const updateRequest = {
      name: formData.name,
      description: formData.description || null,
      branchType: Number(formData.branchType),
      isActive: formData.isActive,
      comment: formData.comment
    };

    this.branchService.createUpdateBranchRequest(this.selectedItem.code, updateRequest)
      .subscribe({
        next: (response) => {
          this.toastService.success('Yêu cầu cập nhật chi nhánh đã được gửi thành công!');
          this.closeModal();
          this.onSearch(); // Reload data
        }
      });
  }

  // Open delete modal
  openDeleteModal(item: Branch): void {
    this.selectedItem = item;
    this.deleteForm.reset();
    this.openModal(this.deleteTemplateRef, {
      class: 'modal-xl',
      backdrop: 'static',
      keyboard: false
    });
  }

  // Confirm delete branch
  confirmDeleteBranch(): void {
    this.deleteForm.markAllAsTouched();
    if (this.deleteForm.invalid || !this.selectedItem?.code) return;

    const formData = this.deleteForm.value;
    
    const deleteRequest: any = {
      comment: formData.comment
    };

    this.branchService.createDeleteBranchRequest(this.selectedItem.code, deleteRequest)
      .subscribe({
        next: (response) => {
          this.toastService.success('Yêu cầu xóa chi nhánh đã được gửi thành công!');
          this.closeModal();
          this.onSearch(); // Reload data
        }
      });
  }

  // Get pending items
  getPendingItems(): void {
    // Gọi API lấy chi nhánh chờ duyệt
    this.loadingTable = true;
    const params = { ...this.pendingSearchParams };
    this.branchService.getPendingBranches(params)
      .pipe(finalize(() => this.loadingTable = false))
      .subscribe({
        next: (res) => {
          if (res?.isSuccess) {
            const { items, totalItems, totalPages, ...page } = res.data || {};
            this.pendingItems = items ?? [];
            this.items = items ?? [];
            this.updatePagingState({ totalItems, totalPages });
          } else {
            this.pendingItems = [];
            this.toastService.error('Không lấy được danh sách chi nhánh chờ duyệt!');
          }
        }
      });
  }

  openRequestDetailModal(item: any): void {
    const requestId = item?.requestId || item?.id;
    if (!requestId) {
      this.toastService.error('Không tìm thấy ID yêu cầu!');
      return;
    }

    this.requestDetailData = null;
    this.selectedItem = item;
    
    // Reset loading states
    this.isApproving = false;
    this.isRejecting = false;

    this.branchService.getBranchRequestDetail(requestId).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.requestDetailData = res.data;
          this.modalRef = this.modalService.show(this.requestDetailTemplateRef, { 
            class: 'modal-xl',
            backdrop: 'static',
            keyboard: false,
            ignoreBackdropClick: true
          });
          
          // Reset loading states when modal is hidden
          this.modalRef.onHidden?.subscribe(() => {
            this.resetLoadingStates();
          });
        } else {
          this.toastService.error('Không thể lấy thông tin chi tiết yêu cầu!');
        }
      }
    });
  }

  private overrideToastIconSize(): void {
    // Override toast icon size after a short delay to ensure DOM is ready
    setTimeout(() => {
      const iconContainers = document.querySelectorAll('.angular-toastify-icon-container');
      iconContainers.forEach((container: any) => {
        container.style.width = '12px';
        container.style.height = '12px';
        container.style.opacity = '1';
        container.style.minWidth = '12px';
        container.style.minHeight = '12px';
        container.style.maxWidth = '12px';
        container.style.maxHeight = '12px';
      });
    }, 100);
  }

  switchTab(tab: 'approved' | 'pending') {
    // Luôn gọi lại API khi chuyển tab, kể cả khi tab không đổi
    this.activeTab = tab;
    this.pagingState.pageIndex = 1; // Reset về trang đầu tiên khi chuyển tab
    this.onSearch();
  }

  // Thay đổi các nơi gọi search() thành onSearch()
  // Trong onSubmitBranch, submitEditBranchForm, confirmDeleteBranch, approveBranch, confirmRejectBranch, v.v.
  // Đổi this.search() thành this.onSearch()
  // Method to reset all loading states
  private resetLoadingStates(): void {
    this.isApproving = false;
    this.isRejecting = false;
  }

  // Method to close modal and reset states
  closeModal(): void {
    // If an action is in progress, show confirmation
    if (this.isApproving || this.isRejecting) {
      if (confirm('Có một thao tác đang được thực hiện. Bạn có chắc chắn muốn hủy?')) {
        this.cancelAction();
        this.modalRef?.hide();
      }
    } else {
      this.modalRef?.hide();
      this.resetLoadingStates();
    }
  }

  /**
   * Hàm mở modal dùng chung
   * @param template TemplateRef<any> của modal
   * @param options Các options cho modalService.show
   */
  openModal(template: TemplateRef<any>, options: any = {}): void {
    this.modalRef = this.modalService.show(template, options);
    this.modalRef.onHidden?.subscribe(() => {
      this.modalRef = null;
      this.resetLoadingStates();
    });
  }

  openApproveModal(item: any): void {
    this.selectedItem = item;
    this.openModal(this.approveTemplateRef, {
      class: 'modal-xl',
      backdrop: 'static',
      keyboard: false,
      ignoreBackdropClick: true
    });
  }

  approveBranch(): void {
    // Prevent double submission
    if (this.isApproving) return;
    
    // Lấy requestId từ requestDetailData hoặc selectedItem
    const requestId = this.requestDetailData?.requestId || this.selectedItem?.requestId || this.selectedItem?.id;
    if (!requestId) {
      this.toastService.error('Không tìm thấy ID yêu cầu!');
      return;
    }

    this.isApproving = true;
    this.branchService.approveBranch(requestId).subscribe({
      next: (res) => {
        this.toastService.success('Phê duyệt yêu cầu thành công!');
        this.modalRef?.hide();
        // Reload data dựa trên tab hiện tại
        this.onSearch();
        this.isApproving = false;
      }
    });
  }

  openRejectModal(item?: any): void {
    if (item) {
      this.selectedItem = item;
    }
    this.rejectForm.reset();

    if (this.modalRef) {
      const oldModalRef = this.modalRef;
      oldModalRef.onHidden?.subscribe(() => {
        this.modalRef = null;
        this.openModal(this.rejectTemplateRef, {
          class: 'modal-xl',
          backdrop: 'static',
          keyboard: false,
          ignoreBackdropClick: true
        });
      });
      oldModalRef.hide();
    } else {
      this.openModal(this.rejectTemplateRef, {
        class: 'modal-xl',
        backdrop: 'static',
        keyboard: false,
        ignoreBackdropClick: true
      });
    }
  }

  confirmRejectBranch(): void {
    this.rejectForm.markAllAsTouched();
    if (this.rejectForm.invalid) return;
    
    // Validate reason length
    const reason = this.rejectForm.value.reason?.trim();
    
    // Lấy requestId từ requestDetailData hoặc selectedItem
    const requestId = this.requestDetailData?.requestId || this.selectedItem?.requestId || this.selectedItem?.id;
    if (!requestId) {
      this.toastService.error('Không tìm thấy ID yêu cầu!');
      return;
    }

    // Gửi request từ chối
    this.branchService.rejectBranch(requestId, reason).subscribe({
      next: (res) => {
        this.toastService.success('Đã từ chối yêu cầu thành công!');
        this.modalRef?.hide();
        // Reload data dựa trên tab hiện tại
        this.onSearch();
      }
    });
  }

  // Method to handle action cancellation
  cancelAction(): void {
    if (this.isApproving || this.isRejecting) {
      this.toastService.warn('Đã hủy thao tác đang thực hiện');
    }
    this.resetLoadingStates();
  }

  getRequestTypeLabel(requestType: string): string {
    const type = (requestType || '').toUpperCase();
    if (type === 'CREATE') return 'Tạo mới';
    if (type === 'UPDATE') return 'Cập nhật';
    if (type === 'DELETE') return 'Xoá';
    return requestType;
  }

  // Helper methods for enhanced detail modal
  getRequestTypeIcon(requestType: string): string {
    const type = (requestType || '').toUpperCase();
    switch (type) {
      case 'CREATE': return 'fas fa-plus-circle';
      case 'UPDATE': return 'fas fa-edit';
      case 'DELETE': return 'fas fa-trash-alt';
      default: return 'fas fa-question-circle';
    }
  }

  getRequestTypeColor(requestType: string): string {
    const type = (requestType || '').toUpperCase();
    switch (type) {
      case 'CREATE': return 'text-success';
      case 'UPDATE': return 'text-warning';
      case 'DELETE': return 'text-danger';
      default: return 'text-muted';
    }
  }

  getRequestTypeBadgeClass(requestType: string): string {
    const type = (requestType || '').toUpperCase();
    switch (type) {
      case 'CREATE': return 'badge bg-success';
      case 'UPDATE': return 'badge bg-warning';
      case 'DELETE': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  hasChanges(field: string): boolean {
    if (!this.requestDetailData?.oldData || !this.requestDetailData?.newData) return false;
    
    return this.requestDetailData.oldData[field] !== this.requestDetailData.newData[field];
  }

  // Helper methods for the actual API response structure
  getBranchCode(data: any): string {
    return data?.branchCode || data?.code;
  }

  getBranchName(data: any): string {
    return data?.branchName || data?.name;
  }



  getCreatedBy(): string {
    return this.requestDetailData?.createdBy;
  }

  getCreatedDate(): string {
    return this.requestDetailData?.createdDate;
  }

  getRequestType(): string {
    return this.requestDetailData?.type;
  }

  handleError(err: any, defaultMsg = 'Đã xảy ra lỗi!') {
    console.error('Branch error:', err);
    const msg = err?.error?.message || defaultMsg;
    this.toastService.error(msg);
  }
}
