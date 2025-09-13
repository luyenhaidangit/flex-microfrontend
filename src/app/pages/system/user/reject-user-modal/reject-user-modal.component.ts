import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
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
  selector: 'app-reject-user-modal',
  templateUrl: './reject-user-modal.component.html',
  styleUrls: ['./reject-user-modal.component.scss']
})
export class RejectUserModalComponent implements OnInit, OnDestroy {
  @Input() selectedRequest: any;
  @Input() modalRef?: BsModalRef | null = null;
  @Output() rejected = new EventEmitter<any>();

  requestDetail: UserRequestDetail | null = null;
  isRejecting = false;
  rejectionReason = '';

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
   * Reject the user request
   */
  rejectUser(): void {
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
    
    this.userService.rejectPendingUserRequest(requestId, this.rejectionReason.trim())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response && response.success) {
            this.toastService.success('Từ chối yêu cầu thành công!');
            this.rejected.emit(response.data);
            this.modalRef?.hide();
          } else {
            this.toastService.error(response?.message || 'Từ chối yêu cầu thất bại!');
          }
          this.isRejecting = false;
        },
        error: (error) => {
          console.error('Error rejecting user request:', error);
          this.toastService.error('Lỗi khi từ chối yêu cầu!');
          this.isRejecting = false;
        }
      });
  }

}
