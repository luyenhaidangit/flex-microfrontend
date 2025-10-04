import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastService } from 'angular-toastify';
import { finalize, takeUntil } from 'rxjs/operators';
import { forkJoin, Subject } from 'rxjs';
import { EntityListComponent } from 'src/app/core/components/base/entity-list.component';
import { WORKFLOW_CONFIG } from './workflow.config';
import { WorkflowService } from './workflow.service';
// Note: local filter shape is simple, avoid strict typing to prevent build import issues

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss']
})
export class WorkflowComponent extends EntityListComponent<any> implements OnInit, OnDestroy {

  CONFIG = WORKFLOW_CONFIG;

  selectedRequest: any = null;
  showRequestDetailModal = false;
  showPublishModal = false;

  constructor(
    private workflowService: WorkflowService,
    private toast: ToastService
  ) {
    super({ keyword: '', state: null, onlyActive: null, type: null });
  }

  ngOnInit(): void {
    this.loadingTable = true;
    const approved$ = this.workflowService.getDefinitions(this.getCleanSearchParams());
    forkJoin({ approved: approved$ })
      .pipe(takeUntil(this.destroy$), finalize(() => (this.loadingTable = false)))
      .subscribe({
        next: ({ approved }) => {
          if (approved?.isSuccess) {
            const { items, pageMeta } = this.extractPagingFromResponse<any>(approved.data);
            this.items = items as any[];
            this.updatePagingState(pageMeta);
          } else {
            this.items = [];
          }
        },
        error: () => {
          this.items = [];
        }
      });
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  public onSearch(): void {
    if (this.activeTabId === 'approved') {
      this.loadData<any>(this.workflowService.getDefinitions(this.getCleanSearchParams()));
    } else {
      this.loadData<any>(this.workflowService.getPendingRequests(this.getCleanSearchParams()));
    }
  }

  openCreateModal(): void { super.openCreateModal(); }
  openDetailModal(item: any): void { super.openDetailModal(item); }
  openEditModal(item: any): void { super.openEditModal(item); }
  openDeleteModal(item: any): void { super.openDeleteModal(item); }
  openPublishModal(item: any): void { this.selectedItem = item; this.showPublishModal = true; }

  openPendingDetailModal(request: any): void {
    this.selectedRequest = request;
    this.showRequestDetailModal = true;
  }
  openApproveModal(request: any): void { this.selectedRequest = request; super.openApproveModal(request); }
  openRejectModal(request: any): void { this.selectedRequest = request; super.openRejectModal(request); }

  onApproved(result: any): void { super.onApproveModalClose(); this.onSearch(); }
  onApproveModalClose(): void { super.onApproveModalClose(); }
  onRejected(result: any): void { super.onRejectModalClose(); this.onSearch(); }
  onRejectModalClose(): void { super.onRejectModalClose(); }
  onDetailModalClose(): void { super.onDetailModalClose(); }
  onCreateModalClose(): void { super.onCreateModalClose(); }
  onCreated(): void { super.onCreateModalClose(); this.onSearch(); }
  onEditModalClose(): void { super.onEditModalClose(); }
  onUpdated(): void { super.onEditModalClose(); this.onSearch(); }
  onDeleteModalClose(): void { super.onDeleteModalClose(); }
  onDeleted(): void { super.onDeleteModalClose(); this.onSearch(); }
  onPublishModalClose(): void { this.showPublishModal = false; this.selectedItem = null; }
  onPublished(_res: any): void { this.onPublishModalClose(); this.onSearch(); }
  onRequestDetailModalClose(): void { this.showRequestDetailModal = false; this.selectedRequest = null; }
}


