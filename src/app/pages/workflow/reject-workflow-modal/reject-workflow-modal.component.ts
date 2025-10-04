import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ToastService } from 'angular-toastify';
import { Subject, takeUntil } from 'rxjs';
import { WorkflowService } from '../workflow.service';

@Component({
  selector: 'app-reject-workflow-modal',
  templateUrl: './reject-workflow-modal.component.html',
  styleUrls: ['./reject-workflow-modal.component.scss']
})
export class RejectWorkflowModalComponent implements OnInit, OnDestroy {
  @Input() isVisible = false;
  @Input() selectedRequest: any;
  @Output() close = new EventEmitter<void>();
  @Output() rejected = new EventEmitter<any>();

  rejectionReason = '';
  isRejecting = false;
  private destroy$ = new Subject<void>();

  constructor(
    private workflowService: WorkflowService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {}

  onClose(): void {
    this.close.emit();
    this.resetStates();
  }

  private resetStates(): void {
    this.isRejecting = false;
    this.rejectionReason = '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  reject(): void {
    if (this.isRejecting) return;
    const requestId = this.selectedRequest?.requestId || this.selectedRequest?.id;
    if (!requestId) {
      this.toastService.error('Không tìm thấy ID yêu cầu!');
      return;
    }
    this.isRejecting = true;
    this.workflowService.rejectPending(requestId, this.rejectionReason ? { reason: this.rejectionReason } : {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res?.isSuccess) {
            this.toastService.success('Từ chối thành công!');
            this.rejected.emit(res.data);
          } else {
            this.toastService.error(res?.message || 'Từ chối thất bại!');
          }
          this.isRejecting = false;
        },
        error: () => {
          this.isRejecting = false;
        }
      });
  }
}


