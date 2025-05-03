import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { SystemService } from 'src/app/core/services/system.service';
import { DEFAULT_PER_PAGE_OPTIONS } from 'src/app/core/constants/shared.constant';
import { ToastService } from 'angular-toastify';

@Component({
  selector: 'app-branch',
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.scss']
})
export class BranchComponent implements OnInit {
  breadCrumbItems = [
    { label: 'Quản trị hệ thống' },
    { label: 'Quản lý chi nhánh', active: true }
  ];

  items: any[] = [];
  selectedItem: any = null;
  modalRef?: BsModalRef;

  pagingState = {
    pageIndex : 1,
    pageSize  : 10,
    totalPages: 0,
    totalItems: 0,
    keyword   : ''
  };

  DEFAULT_PER_PAGE_OPTIONS = DEFAULT_PER_PAGE_OPTIONS;

  branchForm!: FormGroup;
  submitted = false;

  @ViewChild('createModal') createTemplateRef!: TemplateRef<any>;
  @ViewChild('approveModal') approveTemplateRef!: TemplateRef<any>;
  @ViewChild('rejectModal') rejectTemplateRef!: TemplateRef<any>;
  @ViewChild('editModal') editTemplateRef!: TemplateRef<any>;
  @ViewChild('approveEditModal') approveEditTemplateRef!: TemplateRef<any>;
  @ViewChild('rejectEditModal') rejectEditTemplateRef!: TemplateRef<any>;
  rejectForm!: FormGroup;
  submittedReject = false;

  constructor(
    private systemService: SystemService,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.getItems();
    this.branchForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
      name: ['', [Validators.required]],
      address: ['']
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
    this.systemService.getBranchesPaging(this.searchParams)
      .subscribe(res => {
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
    this.selectedItem = item;
    this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
  }

  openCreateModal(): void {
    this.submitted = false;
    this.branchForm.reset();
    this.modalRef = this.modalService.show(this.createTemplateRef, { class: 'modal-lg' });
  }

  openApproveModal(item: any): void {
    this.selectedItem = item;
    this.modalRef = this.modalService.show(this.approveTemplateRef, { class: 'modal-lg' });
  }

  submitBranchForm(): void {
    this.submitted = true;
    if (this.branchForm.invalid) return;

    const payload = this.branchForm.value;
    this.systemService.createBranchRequest(payload).subscribe({
      next: () => {
        this.toastService.success('Tạo yêu cầu chi nhánh thành công!');
        this.modalRef?.hide();
        this.branchForm.reset();
        this.submitted = false;
        this.getItems();
      },
      error: (err) => {
        let errorMsg = 'Tạo yêu cầu thất bại!';
        const apiMsg = err?.error?.message?.toLowerCase();

        if (apiMsg?.includes('branch code already exists')) {
          errorMsg = 'Mã chi nhánh đã tồn tại';
        }

        this.toastService.error(errorMsg);
        console.error('Tạo chi nhánh thất bại', err);
      }
    });
  }

  approveBranch(): void {
    const id = this.selectedItem?.requestId;
    if (!id) return;

    this.systemService.approveBranchRequest(id).subscribe({
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
  
  confirmRejectBranch(): void {
    this.submittedReject = true;
    if (this.rejectForm.invalid) return;
  
    const reason = this.rejectForm.value.reason;
    this.systemService.rejectBranchRequest(this.selectedItem.requestId,reason).subscribe({
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
    this.branchForm.patchValue({
      code: item.code,
      name: item.name,
      address: item.address
    });
    this.modalRef = this.modalService.show(this.editTemplateRef, { class: 'modal-lg' });
  }
  
  submitEditBranchForm(): void {
    this.submitted = true;
    if (this.branchForm.invalid || !this.selectedItem) return;
  
    const payload = {
      code: this.branchForm.value.code,
      name: this.branchForm.value.name,
      address: this.branchForm.value.address,
    };
  
    this.systemService.updateBranchRequest(payload).subscribe({
      next: () => {
        this.toastService.success('Cập nhật chi nhánh thành công!');
        this.modalRef?.hide();
        this.getItems();
      },
      error: () => {
        this.toastService.error('Cập nhật chi nhánh thất bại!');
      }
    });
  }

  openApproveEditModal(item: any): void {
    this.systemService.getPendingUpdateRequest(item.code).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.selectedItem = {
            ...item,
            currentData: {
              code: item.code,
              name: item.name,
              address: item.address
            },
            pendingData: res.data,
            requestId: res.data.requestId
          };
          this.modalRef = this.modalService.show(this.approveEditTemplateRef, { class: 'modal-lg' });
        }
      },
      error: () => {
        this.toastService.error('Không thể lấy thông tin yêu cầu thay đổi!');
      }
    });
  }

  openRejectEditModal(item: any): void {
    this.systemService.getPendingUpdateRequest(item.code).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.selectedItem = {
            ...item,
            currentData: {
              code: item.code,
              name: item.name,
              address: item.address
            },
            pendingData: res.data,
            requestId: res.data.requestId
          };
          this.submittedReject = false;
          this.rejectForm.reset();
          this.modalRef = this.modalService.show(this.rejectEditTemplateRef, { class: 'modal-lg' });
        }
      },
      error: () => {
        this.toastService.error('Không thể lấy thông tin yêu cầu thay đổi!');
      }
    });
  }

  approveEditBranch(): void {
    const id = this.selectedItem?.requestId;
    if (!id) return;

    this.systemService.approveBranchEditRequest(id).subscribe({
      next: () => {
        this.toastService.success('Phê duyệt yêu cầu sửa thành công!');
        this.modalRef?.hide();
        this.getItems();
      },
      error: () => {
        this.toastService.error('Phê duyệt yêu cầu sửa thất bại!');
      }
    });
  }

  confirmRejectEditBranch(): void {
    this.submittedReject = true;
    if (this.rejectForm.invalid) return;

    const reason = this.rejectForm.value.reason;
    this.systemService.rejectBranchEditRequest(this.selectedItem.requestId, reason).subscribe({
      next: () => {
        this.toastService.success('Đã từ chối yêu cầu sửa thành công!');
        this.modalRef?.hide();
        this.getItems();
      },
      error: () => {
        this.toastService.error('Từ chối yêu cầu sửa thất bại!');
      }
    });
  }
}
