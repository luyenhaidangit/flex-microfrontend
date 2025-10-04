import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { ToastService } from 'angular-toastify';
import { Subject, takeUntil } from 'rxjs';
import { WorkflowService } from '../workflow.service';

@Component({
  selector: 'app-approve-workflow-modal',
  templateUrl: './approve-workflow-modal.component.html',
  styleUrls: ['./approve-workflow-modal.component.scss']
})
export class ApproveWorkflowModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isVisible = false;
  @Input() selectedRequest: any;
  @Output() close = new EventEmitter<void>();
  @Output() approved = new EventEmitter<any>();

  isApproving = false;
  private destroy$ = new Subject<void>();

  constructor(
    private workflowService: WorkflowService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {}

  onClose(): void {
    this.close.emit();
    this.resetStates();
  }

  private resetStates(): void {
    this.isApproving = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  approve(): void {
    if (this.isApproving) return;
    const requestId = this.selectedRequest?.requestId || this.selectedRequest?.id;
    if (!requestId) {
      this.toastService.error('Không tìm thấy ID yêu cầu!');
      return;
    }
    this.isApproving = true;
    this.workflowService.approvePending(requestId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res?.isSuccess) {
            this.toastService.success('Phê duyệt thành công!');
            this.approved.emit(res.data);
          } else {
            this.toastService.error(res?.message || 'Phê duyệt thất bại!');
          }
          this.isApproving = false;
        },
        error: () => {
          this.isApproving = false;
        }
      });
  }
}


