import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { ToastService } from 'angular-toastify';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from '../user.service';

export interface UserRequestDetail {
  requestId: number;
  requestedBy: string;
  requestedDate: string;
  requestType: string;
}

@Component({
  selector: 'app-approve-user-modal',
  templateUrl: './approve-user-modal.component.html',
  styleUrls: ['./approve-user-modal.component.scss']
})
export class ApproveUserModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isVisible = false;
  @Input() selectedRequest: any;
  @Output() close = new EventEmitter<void>();
  @Output() approved = new EventEmitter<any>();

  requestDetail: UserRequestDetail | null = null;
  isApproving = false;
  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
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
      this.parseRequestDetailFromData();
    }
    
    // Check if modal visibility changed
    if (changes['isVisible'] && this.isVisible && this.selectedRequest) {
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
    this.isApproving = false;
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
   * Approve the user request
   */
  approveUser(): void {
    // Prevent double submission
    if (this.isApproving) return;
    
    const requestId = this.selectedRequest?.requestId || this.selectedRequest?.id;
    if (!requestId) {
      this.toastService.error('Không tìm thấy ID yêu cầu!');
      return;
    }

    this.isApproving = true;
    
    this.userService.approvePendingUserRequest(requestId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response && response.success) {
            this.toastService.success('Phê duyệt yêu cầu thành công!');
            this.approved.emit(response.data);
            this.onClose();
          } else {
            this.toastService.error(response?.message || 'Phê duyệt yêu cầu thất bại!');
          }
          this.isApproving = false;
        },
        error: (error) => {
          this.isApproving = false;
        }
      });
  }
}
