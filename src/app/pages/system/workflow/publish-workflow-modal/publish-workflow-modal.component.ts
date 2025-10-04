import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ToastService } from 'angular-toastify';
import { Subject, takeUntil } from 'rxjs';
import { WorkflowService } from '../workflow.service';

@Component({
  selector: 'app-publish-workflow-modal',
  templateUrl: './publish-workflow-modal.component.html',
  styleUrls: ['./publish-workflow-modal.component.scss']
})
export class PublishWorkflowModalComponent implements OnInit, OnDestroy {
  @Input() isVisible = false;
  @Input() workflow: any;
  @Output() close = new EventEmitter<void>();
  @Output() published = new EventEmitter<any>();

  isSubmitting = false;
  private destroy$ = new Subject<void>();

  constructor(
    private workflowService: WorkflowService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {}

  onClose(): void {
    this.close.emit();
    this.isSubmitting = false;
  }

  submit(): void {
    if (this.isSubmitting) return;
    const code = this.workflow?.code;
    if (!code) {
      this.toast.error('Không tìm thấy mã workflow!');
      return;
    }
    this.isSubmitting = true;
    this.workflowService.requestPublish(code, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res?.isSuccess) {
            this.toast.success('Gửi yêu cầu publish thành công');
            this.published.emit(res.data);
          } else {
            this.toast.error(res?.message || 'Gửi yêu cầu publish thất bại');
          }
          this.isSubmitting = false;
        },
        error: () => {
          this.isSubmitting = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}


