import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { RoleService } from './role.service';
import { DEFAULT_PER_PAGE_OPTIONS } from 'src/app/core/constants/shared.constant';
import { ToastService } from 'angular-toastify';

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
    keyword   : ''
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
  rejectForm!: FormGroup;
  submittedReject = false;

  constructor(
    private roleService: RoleService,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private toastService: ToastService
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
      this.selectedItem = item;
      this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
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
}
