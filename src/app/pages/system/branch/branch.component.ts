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
}
