import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { ToastService } from 'angular-toastify';
import { Subject, takeUntil } from 'rxjs';
import { BranchService } from '../branch.service';

export interface BranchRequestDetail {
  requestId: number;
  requestedBy: string;
  requestedDate: string;
  requestType: string;
}

@Component({
  selector: 'app-reject-branch-modal',
  templateUrl: './reject-branch-modal.component.html',
  styleUrls: ['./reject-branch-modal.component.scss']
})
export class RejectBranchModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isVisible = false;
  @Input() selectedRequest: any;
  @Output() close = new EventEmitter<void>();
  @Output() rejected = new EventEmitter<any>();

  requestDetail: BranchRequestDetail | null = null;
  isRejecting = false;
  rejectionReason = '';

  private destroy$ = new Subject<void>();

  constructor(
    private branchService: BranchService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    if (this.selectedRequest) {
      this.parseRequestDetailFromData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Check if selectedRequest input changed and modal is visible
    if (changes['selectedRequest'] && this.isVisible && this.selectedRequest) {
      this.resetStates(); // Reset states when new request is selected
      this.parseRequestDetailFromData();
    }
    
    // Check if modal visibility changed
    if (changes['isVisible'] && this.isVisible && this.selectedRequest) {
      this.resetStates(); // Reset states when modal opens
      this.parseRequestDetailFromData();
    }
  }

  onClose(): void {
    this.close.emit();
    this.resetStates();
  }

  // Reset all states
  private resetStates(): void {
    this.requestDetail = null;
    this.isRejecting = false;
    this.rejectionReason = '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Parse request detail from existing data (no API call needed)
   */
  private parseRequestDetailFromData(): void {
    if (!this.selectedRequest) {
      this.toastService.error('Không tìm thấy thông tin yêu cầu!');
      return;
    }

    this.requestDetail = {
      requestId: this.selectedRequest.requestId || this.selectedRequest.id,
      requestedBy: this.selectedRequest.requestedBy || this.selectedRequest.makerBy || 'N/A',
      requestedDate: this.selectedRequest.requestedDate || this.selectedRequest.makerTime || new Date().toISOString(),
      requestType: this.selectedRequest.requestType || this.selectedRequest.action || 'N/A'
    };
  }

  /**
   * Reject the branch request
   */
  rejectBranch(): void {
    // Prevent double submission
    if (this.isRejecting) return;
    
    // Validate rejection reason
    if (!this.rejectionReason || this.rejectionReason.trim().length === 0) {
      this.toastService.error('Vui lòng nhập lý do từ chối!');
      return;
    }

    const requestId = this.selectedRequest?.requestId || this.selectedRequest?.id;
    if (!requestId) {
      this.toastService.error('Không tìm thấy ID yêu cầu!');
      return;
    }

    this.isRejecting = true;
    
    this.branchService.rejectBranch(requestId, this.rejectionReason.trim())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response && response.isSuccess) {
            this.toastService.success('Từ chối yêu cầu thành công!');
            this.rejected.emit(response.data);
            // Modal sẽ tự đóng thông qua event handler trong parent component
          } else {
            this.toastService.error(response?.message || 'Từ chối yêu cầu thất bại!');
          }
          this.isRejecting = false;
        },
        error: (error) => {
          this.isRejecting = false;
        }
      });
  }

}

