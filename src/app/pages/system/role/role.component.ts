import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { RoleService } from './role.service';
import { DEFAULT_PER_PAGE_OPTIONS } from 'src/app/core/constants/shared.constant';
import { ToastService } from 'angular-toastify';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { Role, PagingState, RequestDetailData } from './role.models';
import { UiStateService } from 'src/app/core/services/ui-state.service';
import { finalize } from 'rxjs/operators';

interface RoleSearchParams {
  pageIndex: number;
  pageSize: number;
  keyword?: string;
  isActive?: 'Y' | 'N' | null;
}

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

  
  pendingItems: Role[] = [];
  
  
  isLoading = false;

  pagingState: PagingState = {
    pageIndex : 1,
    pageSize  : 10,
    totalPages: 0,
    totalItems: 0,
    keyword   : '',
    isActive  : null,
    createdDate: null
  };

  DEFAULT_PER_PAGE_OPTIONS = DEFAULT_PER_PAGE_OPTIONS;

  roleForm!: FormGroup;
  submitted = false;

  // Expandable row state for change history
  expandedRows: Set<number> = new Set();

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
  @ViewChild('requestDetailModal') requestDetailTemplateRef!: TemplateRef<any>;
  @ViewChild('detailModal') detailModalTemplateRef!: TemplateRef<any>;
  rejectForm!: FormGroup;
  submittedReject = false;

  // Prepare component
  modalRef?: BsModalRef | null = null;

  // Prepare data for the component
  currentUser: any;
  items: Role[] = [];
  selectedItem: Role | null = null;

  showSubmitConfirm = false;
  rejectedReason: string | null = null;

  // Tab navigation state
  activeTab: 'approved' | 'pending' = 'approved';
  pendingCount: number = 0;

  // Enhanced detail modal properties
  requestDetailData: RequestDetailData | null = null;
  isLoadingRequestDetail = false;
  
  // Loading states for approve/reject actions
  isApproving = false;
  isRejecting = false;

  // Change history loading state
  changeHistory: any[] = [];

  constructor(
    private roleService: RoleService,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private authService: AuthenticationService,
  ) {}


  ngOnInit(): void {
    // Load data
    this.currentUser = this.authService.getCurrentUser();
    this.getItems();

    // Initialize forms
    this.roleForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
      name: ['', [Validators.required]],
      description: ['']
    });

    this.rejectForm = this.fb.group({
      reason: ['', [Validators.required]]
    });
    
    // Override toast icon size with JavaScript
    this.overrideToastIconSize();
  }

  // Mock data for testing expandable rows
  private getMockChangeHistory(): any[] {
    return [
      {
        id: 1,
        timestamp: new Date('2024-01-15T14:30:00'),
        actor: {
          id: 1,
          userName: 'admin_maker',
          email: 'admin.maker@company.com',
          fullName: 'Nguyễn Văn A'
        },
        statusBefore: 'DRAFT',
        statusBeforeLabel: 'Nháp',
        statusAfter: 'PENDING',
        statusAfterLabel: 'Chờ duyệt',
        description: 'Gửi vai trò để phê duyệt',
        changes: {
          'status': 'DRAFT',
          'roleName': 'Quản lý hệ thống',
          'description': 'Vai trò quản lý toàn bộ hệ thống'
        },
        rawData: {
          before: {
            'status': 'DRAFT',
            'roleName': 'Quản lý hệ thống',
            'description': 'Vai trò quản lý toàn bộ hệ thống',
            'isActive': false
          },
          after: {
            'status': 'PENDING',
            'roleName': 'Quản lý hệ thống',
            'description': 'Vai trò quản lý toàn bộ hệ thống',
            'isActive': false
          }
        }
      },
      {
        id: 2,
        timestamp: new Date('2024-01-16T09:15:00'),
        actor: {
          id: 2,
          userName: 'admin_checker',
          email: 'admin.checker@company.com',
          fullName: 'Trần Thị B'
        },
        statusBefore: 'PENDING',
        statusBeforeLabel: 'Chờ duyệt',
        statusAfter: 'APPROVED',
        statusAfterLabel: 'Đã duyệt',
        description: 'Phê duyệt vai trò quản lý hệ thống',
        changes: {
          'status': 'PENDING',
          'isActive': false
        },
        rawData: {
          before: {
            'status': 'PENDING',
            'roleName': 'Quản lý hệ thống',
            'description': 'Vai trò quản lý toàn bộ hệ thống',
            'isActive': false
          },
          after: {
            'status': 'APPROVED',
            'roleName': 'Quản lý hệ thống',
            'description': 'Vai trò quản lý toàn bộ hệ thống',
            'isActive': true
          }
        }
      },
      {
        id: 3,
        timestamp: new Date('2024-01-17T16:45:00'),
        actor: {
          id: 1,
          userName: 'admin_maker',
          email: 'admin.maker@company.com',
          fullName: 'Nguyễn Văn A'
        },
        statusBefore: 'APPROVED',
        statusBeforeLabel: 'Đã duyệt',
        statusAfter: 'APPROVED',
        statusAfterLabel: 'Đã duyệt',
        description: 'Cập nhật thông tin vai trò',
        changes: {
          'roleName': 'Quản lý hệ thống',
          'description': 'Vai trò quản lý toàn bộ hệ thống',
          'isActive': true
        },
        rawData: {
          before: {
            'status': 'APPROVED',
            'roleName': 'Quản lý hệ thống',
            'description': 'Vai trò quản lý toàn bộ hệ thống',
            'isActive': true
          },
          after: {
            'status': 'APPROVED',
            'roleName': 'Quản lý hệ thống v2.0',
            'description': 'Vai trò quản lý toàn bộ hệ thống với quyền mở rộng',
            'isActive': true
          }
        }
      },
      {
        id: 4,
        timestamp: new Date('2024-01-18T11:20:00'),
        actor: {
          id: 3,
          userName: 'system_admin',
          email: 'system.admin@company.com',
          fullName: 'Lê Văn C'
        },
        statusBefore: 'APPROVED',
        statusBeforeLabel: 'Đã duyệt',
        statusAfter: 'APPROVED',
        statusAfterLabel: 'Đã duyệt',
        description: 'Tạm thời vô hiệu hóa vai trò',
        changes: {
          'isActive': true
        },
        rawData: {
          before: {
            'status': 'APPROVED',
            'roleName': 'Quản lý hệ thống v2.0',
            'description': 'Vai trò quản lý toàn bộ hệ thống với quyền mở rộng',
            'isActive': true
          },
          after: {
            'status': 'APPROVED',
            'roleName': 'Quản lý hệ thống v2.0',
            'description': 'Vai trò quản lý toàn bộ hệ thống với quyền mở rộng',
            'isActive': false
          }
        }
      },
      {
        id: 5,
        timestamp: new Date('2024-01-19T08:30:00'),
        actor: {
          id: 1,
          userName: 'admin_maker',
          email: 'admin.maker@company.com',
          fullName: 'Nguyễn Văn A'
        },
        statusBefore: 'APPROVED',
        statusBeforeLabel: 'Đã duyệt',
        statusAfter: 'APPROVED',
        statusAfterLabel: 'Đã duyệt',
        description: 'Kích hoạt lại vai trò và cập nhật mô tả',
        changes: {
          'description': 'Vai trò quản lý toàn bộ hệ thống với quyền mở rộng',
          'isActive': false
        },
        rawData: {
          before: {
            'status': 'APPROVED',
            'roleName': 'Quản lý hệ thống v2.0',
            'description': 'Vai trò quản lý toàn bộ hệ thống với quyền mở rộng',
            'isActive': false
          },
          after: {
            'status': 'APPROVED',
            'roleName': 'Quản lý hệ thống v2.0',
            'description': 'Vai trò quản lý toàn bộ hệ thống với quyền mở rộng và bảo mật nâng cao',
            'isActive': true
          }
        }
      }
    ];
  }

  // Handle search alll items
  get searchParams(): RoleSearchParams {
    const { pageIndex, pageSize, keyword, isActive } = this.pagingState;
    const params: RoleSearchParams = { pageIndex, pageSize };
    if (keyword?.trim()) params.keyword = keyword.trim();
    if (isActive === true) params.isActive = 'Y';
    else if (isActive === false) params.isActive = 'N';
    return params;
  }

  private updatePagingState(page: Partial<PagingState>) {
    Object.assign(this.pagingState, {
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      totalPages: page.totalPages,
      totalItems: page.totalItems
    });
  }

  getItems(): void {
    this.isLoading = true;
    this.roleService.getApprovedRoles({ ...this.searchParams })
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (res) => {
          if (res?.isSuccess) {
            const { items, ...page } = res.data;
            this.items = items ?? [];
            this.updatePagingState(page);
          } else {
            this.items = [];
            this.toastService.error('Không lấy được danh sách vai trò!');
          }
        },
        error: (err) => {
          this.items = [];
          this.toastService.error('Đã xảy ra lỗi khi lấy danh sách vai trò!');
          console.error('getItems error:', err);
        }
      });
  }

  onSearch(): void {
    if (this.activeTab === 'approved') {
      this.getItems();
    } else {
      this.getPendingItems();
    }
  }

  changePage(page: number): void {
    if (page < 1 || page > this.pagingState.totalPages || page === this.pagingState.pageIndex) return;
    this.pagingState.pageIndex = page;
    this.onSearch();
  }

  changePageSize(): void {
    this.pagingState.pageIndex = 1;
    this.onSearch();
  }

  // Handle view detail item
  openDetailModal(item: any): void {
    if (this.activeTab === 'approved') {
      const code = item?.code;
      if (!code) {
        this.toastService.error('Không tìm thấy mã vai trò!');
        return;
      }
      this.selectedItem = null;
      this.isLoadingRequestDetail = true;
      this.roleService.getApprovedRoleByCode(code).subscribe({
        next: (res) => {
          this.selectedItem = res?.data || item;
          
          // Reset change history when opening modal
          this.changeHistory = [];
          this.expandedRows.clear();
          
          this.modalRef = this.modalService.show(this.detailModalTemplateRef, { 
            class: 'modal-xl',
            backdrop: 'static',
            keyboard: false, 
          });
          this.isLoadingRequestDetail = false;
        },
        error: () => {
          this.toastService.error('Không thể lấy thông tin chi tiết vai trò!');
          this.selectedItem = item;
          this.modalRef = this.modalService.show(this.detailModalTemplateRef, { class: 'modal-lg' });
          this.isLoadingRequestDetail = false;
        }
      });
    } else {
      // pending tab: show request detail modal
      const requestId = item?.requestId || item?.id;
      if (!requestId) {
        this.toastService.error('Không tìm thấy ID yêu cầu!');
        return;
      }
      this.isLoadingRequestDetail = true;
      this.requestDetailData = null;
      this.selectedItem = item;
      this.isApproving = false;
      this.isRejecting = false;
      this.roleService.getRoleRequestDetail(requestId).subscribe({
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
          this.isLoadingRequestDetail = false;
        },
        error: (err) => {
          console.error('Error fetching request detail:', err);
          let errorMsg = 'Không thể lấy thông tin chi tiết yêu cầu!';
          if (err?.error?.message) {
            errorMsg = err.error.message;
          } else if (err?.status === 404) {
            errorMsg = 'Không tìm thấy yêu cầu!';
          } else if (err?.status === 403) {
            errorMsg = 'Bạn không có quyền xem chi tiết yêu cầu này!';
          }
          this.toastService.error(errorMsg);
          this.isLoadingRequestDetail = false;
        }
      });
    }
  }

  openRequestDetailModal(item: any): void {
    const requestId = item?.requestId || item?.id;
    if (!requestId) {
      this.toastService.error('Không tìm thấy ID yêu cầu!');
      return;
    }

    this.isLoadingRequestDetail = true;
    this.requestDetailData = null;
    this.selectedItem = item;
    
    // Reset loading states
    this.isApproving = false;
    this.isRejecting = false;

    this.roleService.getRoleRequestDetail(requestId).subscribe({
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
        this.isLoadingRequestDetail = false;
      },
      error: (err) => {
        console.error('Error fetching request detail:', err);
        let errorMsg = 'Không thể lấy thông tin chi tiết yêu cầu!';
        
        // Handle specific error messages
        if (err?.error?.message) {
          errorMsg = err.error.message;
        } else if (err?.status === 404) {
          errorMsg = 'Không tìm thấy yêu cầu!';
        } else if (err?.status === 403) {
          errorMsg = 'Bạn không có quyền xem chi tiết yêu cầu này!';
        }
        
        this.toastService.error(errorMsg);
        this.isLoadingRequestDetail = false;
      }
    });
  }

  openDetailModal1(template: TemplateRef<any>, item: any): void {
    const code = item?.code;
    if (!code) {
      this.toastService.error('Không tìm thấy mã vai trò!');
      return;
    }
    this.roleService.getApprovedRoleByCode(code).subscribe({
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
    this.search();
  }

  

  

  getPendingItems(): void {
    this.isLoading = true;
    // Gọi API lấy vai trò chờ duyệt
    const params = { ...this.searchParams };
    this.roleService.getPendingRoles(params)
      .subscribe({
        next: (res) => {
          if (res?.isSuccess) {
            const { items, ...page } = res.data;
            this.pendingItems = items ?? [];
            Object.assign(this.pagingState, {
              pageIndex : page.pageIndex,
              pageSize  : page.pageSize,
              totalPages: page.totalPages,
              totalItems: page.totalItems
            });
          } else {
            this.pendingItems = [];
          }
          this.isLoading = false;
        },
        error: () => {
          this.pendingItems = [];
          this.isLoading = false;
        }
      });
  }

  // Thay đổi các hàm tìm kiếm/phân trang để gọi đúng API theo tab
  search(): void {
    if (this.activeTab === 'pending') {
      this.getPendingItems();
    } else {
      this.getItems();
    }
  }
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

  openCreateModal(): void {
    this.submitted = false;
    this.roleForm.reset();
    this.rejectedReason = null;
    this.openModal(this.createTemplateRef, { class: 'modal-lg' });
  }

  openApproveModal(item: any): void {
    this.selectedItem = item;
    this.openModal(this.approveTemplateRef, {
      class: 'modal-lg',
      backdrop: 'static',
      keyboard: false,
      ignoreBackdropClick: true
    });
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
        // Reload data dựa trên tab hiện tại
        this.search();
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
    // Prevent double submission
    if (this.isApproving) return;
    
    // Lấy requestId từ requestDetailData hoặc selectedItem
    const requestId = this.requestDetailData?.requestId || this.selectedItem?.requestId || this.selectedItem?.id;
    if (!requestId) {
      this.toastService.error('Không tìm thấy ID yêu cầu!');
      return;
    }

    this.isApproving = true;
    this.roleService.approveRole(requestId).subscribe({
      next: (res) => {
        this.toastService.success('Phê duyệt yêu cầu thành công!');
        this.modalRef?.hide();
        // Reload data dựa trên tab hiện tại
        this.search();
        this.isApproving = false;
      },
      error: (err) => {
        console.error('Approve role error:', err);
        let errorMsg = 'Phê duyệt thất bại!';
        
        // Handle specific error messages
        if (err?.error?.message) {
          errorMsg = err.error.message;
        } else if (err?.status === 404) {
          errorMsg = 'Không tìm thấy yêu cầu phê duyệt!';
        } else if (err?.status === 403) {
          errorMsg = 'Bạn không có quyền phê duyệt yêu cầu này!';
        } else if (err?.status === 409) {
          errorMsg = 'Yêu cầu đã được xử lý trước đó!';
        }
        
        this.toastService.error(errorMsg);
        this.isApproving = false;
      }
    });
  }

  openRejectModal(item?: any): void {
    if (item) {
      this.selectedItem = item;
    }
    this.submittedReject = false;
    this.rejectForm.reset();

    if (this.modalRef) {
      const oldModalRef = this.modalRef;
      oldModalRef.onHidden?.subscribe(() => {
        this.modalRef = null;
        this.openModal(this.rejectTemplateRef, {
          class: 'modal-md',
          backdrop: 'static',
          keyboard: false,
          ignoreBackdropClick: true
        });
      });
      oldModalRef.hide();
    } else {
      this.openModal(this.rejectTemplateRef, {
        class: 'modal-md',
        backdrop: 'static',
        keyboard: false,
        ignoreBackdropClick: true
      });
    }
  }

  confirmRejectRole(): void {
    this.submittedReject = true;
    if (this.rejectForm.invalid) return;
    
    // Không cần kiểm tra hoặc set isRejecting nữa
    // Validate reason length
    const reason = this.rejectForm.value.reason?.trim();
    
    // Lấy requestId từ requestDetailData hoặc selectedItem
    const requestId = this.requestDetailData?.requestId || this.selectedItem?.requestId || this.selectedItem?.id;
    if (!requestId) {
      this.toastService.error('Không tìm thấy ID yêu cầu!');
      return;
    }

    // Gửi request từ chối, không cần set isRejecting
    this.roleService.rejectRole(requestId, reason).subscribe({
      next: (res) => {
        this.toastService.success('Đã từ chối yêu cầu thành công!');
        this.modalRef?.hide();
        // Reload data dựa trên tab hiện tại
        this.search();
        // Không cần set isRejecting = false
      },
      error: (err) => {
        console.error('Reject role error:', err);
        let errorMsg = 'Từ chối yêu cầu thất bại!';
        
        // Handle specific error messages
        if (err?.error?.message) {
          errorMsg = err.error.message;
        } else if (err?.status === 404) {
          errorMsg = 'Không tìm thấy yêu cầu để từ chối!';
        } else if (err?.status === 403) {
          errorMsg = 'Bạn không có quyền từ chối yêu cầu này!';
        } else if (err?.status === 409) {
          errorMsg = 'Yêu cầu đã được xử lý trước đó!';
        } else if (err?.status === 400) {
          errorMsg = 'Lý do từ chối không hợp lệ!';
        } else if (err?.status === 500) {
          errorMsg = 'Lỗi máy chủ, vui lòng thử lại sau!';
        }
        
        this.toastService.error(errorMsg);
        // Không cần set isRejecting = false
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
        // Reload data dựa trên tab hiện tại
        this.search();
      },
      error: () => {
        this.toastService.error('Cập nhật vai trò thất bại!');
      }
    });
  }

  confirmDeleteRole(): void {
    if (!this.selectedItem?.code) return;
    this.roleService.deleteRole(this.selectedItem.code).subscribe({
      next: () => {
        this.toastService.success('Đã gửi yêu cầu xóa thành công!');
        this.modalRef?.hide();
        // Reload data dựa trên tab hiện tại
        this.search();
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
        // Reload data dựa trên tab hiện tại
        this.search();
      },
      error: () => {
        this.toastService.error('Lưu nháp thất bại!');
      }
    });
  }

  // Thêm hàm gửi duyệt đơn giản
  onSubmitRole(): void {
    this.submitted = true;
    if (this.roleForm.invalid) return;
    const payload = this.roleForm.value;
    this.roleService.createRole(payload).subscribe({
      next: () => {
        this.toastService.success('Gửi duyệt thành công!');
        this.modalRef?.hide();
        this.roleForm.reset();
        this.submitted = false;
        // Reload data dựa trên tab hiện tại
        this.search();
      },
      error: (err) => {
        const msg = err?.error?.message || 'Gửi duyệt thất bại!';
        this.toastService.error(msg);
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
      case 'DRAFT': return 'Nháp';
      case 'PENDING': return 'Chờ duyệt';
      case 'APPROVED': return 'Đã duyệt';
      case 'REJECTED': return 'Từ chối';
      default: return status;
    }
  }

  getStatusBadgeClass(status: string): string {
    const s = (status || '').toUpperCase();
    if (s === 'DRAFT') return 'badge badge-soft-secondary';
    if (s === 'PENDING') return 'badge badge-soft-warning';
    if (s === 'APPROVED') return 'badge badge-soft-success';
    if (s === 'REJECTED') return 'badge badge-soft-danger';
    return 'badge badge-soft-light';
  }

  getStatusLabel(status: string): string {
    const s = (status || '').toUpperCase();
    if (s === 'DRAFT') return 'Nháp';
    if (s === 'PENDING') return 'Chờ duyệt';
    if (s === 'APPROVED') return 'Đã duyệt';
    if (s === 'REJECTED') return 'Từ chối';
    return status;
  }

  getRequestTypeLabel(requestType: string): string {
    const type = (requestType || '').toUpperCase();
    if (type === 'CREATE') return 'Tạo mới';
    if (type === 'UPDATE') return 'Cập nhật';
    if (type === 'DELETE') return 'Xoá';
    return requestType;
  }

  // Xóa các hàm openDeleteDraftModal, confirmDeleteDraft, và logic liên quan đến nháp nếu có

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
      case 'CREATE': return 'badge-soft-success';
      case 'UPDATE': return 'badge-soft-warning';
      case 'DELETE': return 'badge-soft-danger';
      default: return 'badge-soft-light';
    }
  }

  hasChanges(field: string): boolean {
    if (!this.requestDetailData?.oldData || !this.requestDetailData?.newData) return false;
    
    if (field === 'permissions') {
      // Compare permissions arrays
      const oldPerms = this.getPermissions(this.requestDetailData.oldData);
      const newPerms = this.getPermissions(this.requestDetailData.newData);
      return oldPerms.length !== newPerms.length || 
             JSON.stringify(oldPerms) !== JSON.stringify(newPerms);
    }
    
    return this.requestDetailData.oldData[field] !== this.requestDetailData.newData[field];
  }

  getFieldValue(data: any, field: string): string {
    return data?.[field] || '—';
  }

  getFieldDisplayValue(data: any, field: string): string {
    const value = this.getFieldValue(data, field);
    if (field === 'status') {
      return this.getStatusLabel(value);
    }
    return value;
  }

  getChangedFieldsCount(changes?: any): number {
    if (changes) {
      // Cho lịch sử thay đổi
      return Object.keys(changes).length;
    }
    
    // Cho request detail
    if (!this.requestDetailData?.oldData || !this.requestDetailData?.newData) return 0;
    
    const fields = ['roleCode', 'roleName', 'description'];
    return fields.filter(field => this.hasChanges(field)).length;
  }

  // New helper methods for the actual API response structure
  getRoleCode(data: any): string {
    return data?.roleCode || '—';
  }

  getRoleName(data: any): string {
    return data?.roleName || '—';
  }

  getRoleDescription(data: any): string {
    return data?.description || '—';
  }

  getPermissions(data: any): any[] {
    return data?.permissions || [];
  }

  getCreatedBy(): string {
    return this.requestDetailData?.createdBy || '—';
  }

  getCreatedDate(): string {
    return this.requestDetailData?.createdDate || '—';
  }

  getRequestType(): string {
    return this.requestDetailData?.type || '—';
  }

  getStatusTooltip(status: string): string {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'DRAFT': return 'Vai trò đang ở trạng thái nháp, chưa được gửi duyệt';
      case 'PENDING': return 'Vai trò đang chờ phê duyệt từ người có thẩm quyền';
      case 'APPROVED': return 'Vai trò đã được phê duyệt và có thể sử dụng';
      case 'REJECTED': return 'Vai trò đã bị từ chối, cần chỉnh sửa và gửi lại';
      default: return 'Trạng thái không xác định';
    }
  }

  viewChangeDetails(history: any): void {
    // Hiển thị modal với JSON chi tiết
    const jsonData = {
      before: history.rawData?.before,
      after: history.rawData?.after,
      changes: history.changes
    };
    
    // Có thể mở modal hoặc hiển thị trong console
    console.log('Change Details:', jsonData);
    this.toastService.info('Xem chi tiết trong Console (F12)');
  }

  compareChanges(history: any): void {
    const compareData = {
      before: history.rawData?.before,
      after: history.rawData?.after,
      changes: history.changes,
      description: history.description
    };
    console.log('Compare Data:', compareData);
    this.toastService.info('Tính năng so sánh đang được phát triển');
  }

  // Expandable row methods for change history
  toggleRowExpansion(historyIndex: number): void {
    if (this.expandedRows.has(historyIndex)) {
      this.expandedRows.delete(historyIndex);
    } else {
      this.expandedRows.add(historyIndex);
    }
  }

  // Load change history when history tab is opened
  loadChangeHistory(): void {
    if (!this.selectedItem?.code) {
      this.toastService.error('Không tìm thấy mã vai trò!');
      return;
    }

    // Only load if not already loaded
    if (this.changeHistory.length > 0) {
      return;
    }

    this.isLoading = true;
    this.roleService.getRoleChangeHistory(this.selectedItem.code).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.changeHistory = res.data || [];
        } else {
          this.changeHistory = [];
          this.toastService.error('Không thể lấy lịch sử thay đổi!');
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching change history:', err);
        this.changeHistory = [];
        
        // For testing purposes, use mock data if API fails
        this.changeHistory = this.getMockChangeHistory();
        this.toastService.warn('Sử dụng dữ liệu mẫu cho lịch sử thay đổi');
        this.isLoading = false;
      }
    });
  }

  isRowExpanded(historyIndex: number): boolean {
    return this.expandedRows.has(historyIndex);
  }

  getChangedFields(history: any): string[] {
    if (!history.changes) return [];
    return Object.keys(history.changes);
  }

  getFieldBeforeValue(history: any, field: string): string {
    if (!history.rawData?.before) return '—';
    return history.rawData.before[field] || '—';
  }

  getFieldAfterValue(history: any, field: string): string {
    if (!history.rawData?.after) return '—';
    return history.rawData.after[field] || '—';
  }

  getFieldDisplayName(field: string): string {
    const fieldNames: { [key: string]: string } = {
      'roleCode': 'Mã vai trò',
      'roleName': 'Tên vai trò', 
      'name': 'Tên vai trò',
      'code': 'Mã vai trò',
      'description': 'Mô tả',
      'isActive': 'Trạng thái hoạt động',
      'status': 'Trạng thái phê duyệt'
    };
    return fieldNames[field] || field;
  }

  getFieldValueDisplay(value: any): string {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') {
      return value ? 'Hoạt động' : 'Không hoạt động';
    }
    return String(value);
  }

}
