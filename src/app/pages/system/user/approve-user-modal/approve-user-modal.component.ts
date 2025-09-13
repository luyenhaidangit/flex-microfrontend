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
  userName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  branchName: string;
  roleName: string;
}

@Component({
  selector: 'app-approve-user-modal',
  templateUrl: './approve-user-modal.component.html',
  styleUrls: ['./approve-user-modal.component.scss']
})
export class ApproveUserModalComponent implements OnInit, OnDestroy {
  @Input() selectedRequest: any;
  @Input() modalRef?: BsModalRef | null = null;
  @Output() approved = new EventEmitter<any>();

  requestDetail: UserRequestDetail | null = null;
  isLoading = false;
  isApproving = false;
  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    if (this.selectedRequest) {
      this.loadRequestDetail();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load detailed information of the user request
   */
  private loadRequestDetail(): void {
    if (!this.selectedRequest?.requestId && !this.selectedRequest?.id) {
      this.toastService.error('Không tìm thấy ID yêu cầu!');
      return;
    }

    const requestId = this.selectedRequest?.requestId || this.selectedRequest?.id;
    this.isLoading = true;

    this.userService.getPendingUserRequestById(requestId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response && response.success) {
            this.requestDetail = this.parseRequestDetail(response.data);
          } else {
            this.toastService.error('Không thể tải thông tin chi tiết yêu cầu!');
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading request detail:', error);
          this.toastService.error('Lỗi khi tải thông tin chi tiết yêu cầu!');
          this.isLoading = false;
        }
      });
  }

  /**
   * Parse request detail from API response
   */
  private parseRequestDetail(data: any): UserRequestDetail {
    try {
      // Parse the requested data JSON if it exists
      let userData = {};
      if (data.requestedData) {
        userData = typeof data.requestedData === 'string' 
          ? JSON.parse(data.requestedData) 
          : data.requestedData;
      }

      return {
        requestId: data.requestId || data.id,
        requestedBy: data.requestedBy || data.makerBy || 'N/A',
        requestedDate: data.requestedDate || data.makerTime || new Date().toISOString(),
        requestType: data.requestType || data.action || 'N/A',
        userName: userData['userName'] || userData['UserName'] || 'N/A',
        fullName: userData['fullName'] || userData['FullName'] || 'N/A',
        email: userData['email'] || userData['Email'] || 'N/A',
        phoneNumber: userData['phoneNumber'] || userData['PhoneNumber'] || 'N/A',
        branchName: userData['branchName'] || userData['BranchName'] || 'N/A',
        roleName: userData['roleName'] || userData['RoleName'] || 'N/A'
      };
    } catch (error) {
      console.error('Error parsing request detail:', error);
      return {
        requestId: data.requestId || data.id,
        requestedBy: data.requestedBy || 'N/A',
        requestedDate: data.requestedDate || new Date().toISOString(),
        requestType: data.requestType || 'N/A',
        userName: 'N/A',
        fullName: 'N/A',
        email: 'N/A',
        phoneNumber: 'N/A',
        branchName: 'N/A',
        roleName: 'N/A'
      };
    }
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
            this.modalRef?.hide();
          } else {
            this.toastService.error(response?.message || 'Phê duyệt yêu cầu thất bại!');
          }
          this.isApproving = false;
        },
        error: (error) => {
          console.error('Error approving user request:', error);
          this.toastService.error('Lỗi khi phê duyệt yêu cầu!');
          this.isApproving = false;
        }
      });
  }
}
