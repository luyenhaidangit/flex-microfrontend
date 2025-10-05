import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { BranchService } from './branch.service';
import { ToastService } from 'angular-toastify';
import { BranchItem, BranchFilter, RequestDetailData } from './branch.models';
import { BRANCH_CONFIG } from './branch.config';
import { EntityListComponent } from 'src/app/core/components/base/entity-list.component';
import { forkJoin, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-branch',
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.scss']
})
export class BranchComponent extends EntityListComponent<BranchFilter> implements OnInit, OnDestroy {
  
  CONFIG = BRANCH_CONFIG;

  @ViewChild('detailModal') detailModalTemplateRef!: TemplateRef<any>;
  @ViewChild('createModal') createTemplateRef!: TemplateRef<any>;
  @ViewChild('editModal') editTemplateRef!: TemplateRef<any>;
  @ViewChild('deleteModal') deleteTemplateRef!: TemplateRef<any>;

  branchForm!: FormGroup;
  deleteForm!: FormGroup;

  selectedRequest: any = null;
  showRequestDetailModal = false;

  @ViewChild('approveModal') approveTemplateRef!: TemplateRef<any>;
  @ViewChild('rejectModal') rejectTemplateRef!: TemplateRef<any>;
  @ViewChild('approveEditModal') approveEditTemplateRef!: TemplateRef<any>;
  @ViewChild('rejectEditModal') rejectEditTemplateRef!: TemplateRef<any>;
  @ViewChild('approveDeleteModal') approveDeleteTemplateRef!: TemplateRef<any>;
  @ViewChild('rejectDeleteModal') rejectDeleteTemplateRef!: TemplateRef<any>;
  @ViewChild('deleteDraftModal') deleteDraftModal!: TemplateRef<any>;
  @ViewChild('requestDetailModal') requestDetailTemplateRef!: TemplateRef<any>;
  rejectForm!: FormGroup;

  // Prepare component
  isLoadingHistory = false;
  isLoadingRequestDetail = false;
  modalRef?: BsModalRef | null = null;
  isSubmitting: boolean = false;

  // Prepare data for the component
  selectedItem: BranchItem | null = null;
  changeHistory: any[] = [];

  showSubmitConfirm = false;
  rejectedReason: string | null = null;

  // Enhanced detail modal properties
  requestDetailData: RequestDetailData | null = null;
  
  // Branch type options for selects
  branchTypes: number[] = [1, 2, 3];
  
  // Loading states for approve/reject actions
  isApproving = false;
  isRejecting = false;

  // Helper methods
  public getBranchTypeLabel = this.getBranchTypeLabelHelper;
  
  private getBranchTypeLabelHelper(branchType: number): string {
    switch (branchType) {
      case 1: return 'Hội sở chính';
      case 2: return 'Chi nhánh';
      case 3: return 'Phòng giao dịch';
      default: return 'Không xác định';
    }
  }

  trackByCode(_: number, item: BranchItem) { return item.code; }
  trackById(_: number, item: any)    { return item.requestId ?? item.id; }

  constructor(
    private branchService: BranchService,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {
    super({ keyword: '', isActive: null, type: null });
  }

  ngOnInit(): void {
    this.loadingTable = true;
    
    // Load initial data
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

  ngOnDestroy(): void {
    this.cleanup();
  }

  // Implement abstract method from base class
  public onSearch(): void {
    if (this.activeTabId === 'approved') {
      this.loadData<BranchItem>(this.branchService.getApprovedBranches(this.getCleanSearchParams()));
    } else {
      this.loadData<any>(this.branchService.getPendingBranches(this.getCleanSearchParams()));
    }
  }

  onTabChange(tabId: string): void {
    this.activeTabId = tabId;
    this.onSearch();
  }

  // Override detail modal to add branch-specific logic
  override openDetailModal(branch: BranchItem): void {
    super.openDetailModal(branch);
  }

  // Pending request methods
  openPendingDetailModal(request: any): void {
    this.selectedRequest = request;
    this.showRequestDetailModal = true;
  }
  
  // Override approve modal to add branch-specific logic
  override openApproveModal(request: any): void {
    this.selectedRequest = request;
    super.openApproveModal(request);
  }
  
  // Override reject modal to add branch-specific logic
  override openRejectModal(request: any): void {
    this.selectedRequest = request;
    super.openRejectModal(request);
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

  // Override create modal to add branch-specific logic
  override openCreateModal(): void {
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

  // Override edit modal to add branch-specific logic
  override openEditModal(item: BranchItem): void {
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
          this.onSearch();
        }
      });
  }

  // Override delete modal to add branch-specific logic
  override openDeleteModal(item: BranchItem): void {
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
          this.onSearch();
        }
      });
  }

  // Handle approve success
  onBranchApproved(result: any): void {
    console.log('Branch request approved:', result);
    super.onApproveModalClose();
    this.onSearch();
  }

  onApproveModalClose(): void {
    super.onApproveModalClose();
  }
  
  // Handle reject success
  onBranchRejected(result: any): void {
    console.log('Branch request rejected:', result);
    super.onRejectModalClose();
    this.onSearch();
  }

  onRejectModalClose(): void {
    super.onRejectModalClose();
  }
  
  // Modal callback methods
  onDetailModalClose(): void {
    super.onDetailModalClose();
  }
  
  onCreateModalClose(): void {
    super.onCreateModalClose();
  }
  
  onBranchCreated(): void {
    super.onCreateModalClose();
    this.onSearch();
  }
  
  onEditModalClose(): void {
    super.onEditModalClose();
  }
  
  onBranchUpdated(): void {
    super.onEditModalClose();
    this.onSearch();
  }
  
  onDeleteModalClose(): void {
    super.onDeleteModalClose();
  }
  
  onBranchDeleted(): void {
    super.onDeleteModalClose();
    this.onSearch();
  }
  
  // Request detail modal methods
  onRequestDetailModalClose(): void {
    this.showRequestDetailModal = false;
    this.selectedRequest = null;
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

  // Method to handle modal backdrop click
  onBackdropClick(): void {
    if (this.isApproving || this.isRejecting) {
      this.toastService.warn('Không thể đóng modal khi đang thực hiện thao tác');
      return;
    }
    this.closeModal();
  }

  // Method to handle ESC key press
  onEscKey(): void {
    if (this.isApproving || this.isRejecting) {
      this.toastService.warn('Không thể đóng modal khi đang thực hiện thao tác');
      return;
    }
    this.closeModal();
  }

  // Hàm xử lý input: upperCase và loại bỏ dấu cách, có thể tái sử dụng cho các input khác
  onInputUpperNoSpace(controlName: string, event: any) {
    const value = event.target.value.toUpperCase().replace(/\s+/g, '');
    this.branchForm.get(controlName)?.setValue(value, { emitEvent: false });
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

  // Missing methods referenced in template
  saveDraftBranch(): void {
    // Implementation for saving draft branch
    this.toastService.info('Chức năng lưu nháp đang được phát triển');
  }

  openDeleteDraftModal(): void {
    // Implementation for opening delete draft modal
    this.openModal(this.deleteDraftModal, {
      class: 'modal-xl',
      backdrop: 'static',
      keyboard: false
    });
  }

  confirmDeleteDraft(): void {
    // Implementation for confirming delete draft
    this.toastService.info('Chức năng xóa nháp đang được phát triển');
    this.closeModal();
  }

  handleError(err: any, defaultMsg = 'Đã xảy ra lỗi!') {
    console.error('Branch error:', err);
    const msg = err?.error?.message || defaultMsg;
    this.toastService.error(msg);
  }
}
