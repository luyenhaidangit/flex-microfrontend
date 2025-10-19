import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { ToastService } from 'angular-toastify';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UserService } from '../issuer.service';
import { UserItem } from '../issuer.models';

export interface UserRequestDetailData {
	requestId: string | number;
	createdBy?: string;
	createdDate?: string;
	type?: 'CREATE' | 'UPDATE' | 'DELETE';
	requestedBy?: string;
	requestedDate?: string;
	requestType?: 'CREATE' | 'UPDATE' | 'DELETE';
	status?: string;
	newData?: any;
	oldData?: any;
	rejectReason?: string;
	rejectedBy?: string;
	rejectedDate?: string;
}

@Component({
	selector: 'app-user-request-detail-modal',
	templateUrl: './user-request-detail-modal.component.html',
	styleUrls: ['./user-request-detail-modal.component.scss']
})
export class UserRequestDetailModalComponent implements OnInit, OnDestroy, OnChanges {
	@Input() isVisible = false;
	@Input() selectedRequest: any = null;
	@Output() close = new EventEmitter<void>();

	requestDetailData: UserRequestDetailData | null = null;
	isLoadingRequestDetail = false;
	private hasLoadedForCurrentRequest = false;

	private destroy$ = new Subject<void>();

	constructor(
		private userService: UserService,
		private toast: ToastService
	) {}

	ngOnInit(): void {
	}

	ngOnChanges(changes: SimpleChanges): void {
		// Reset flag when selectedRequest changes
		if (changes['selectedRequest']) {
			this.hasLoadedForCurrentRequest = false;
		}
		
		// Only load when modal becomes visible AND we have a selected request AND haven't loaded yet
		if (this.isVisible && this.selectedRequest && !this.hasLoadedForCurrentRequest) {
			this.loadRequestDetail();
		}
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	onClose(): void {
		this.close.emit();
		this.resetStates();
	}

	// Load detailed request information
	private loadRequestDetail(): void {
		if (!this.selectedRequest?.requestId) {
			this.toast.error('Không tìm thấy thông tin yêu cầu!');
			this.onClose();
			return;
		}

		// Prevent duplicate calls
		if (this.hasLoadedForCurrentRequest) {
			return;
		}

		this.isLoadingRequestDetail = true;
		this.requestDetailData = null;
		this.hasLoadedForCurrentRequest = true;

		this.userService.getPendingUserRequestById(this.selectedRequest.requestId)
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => this.isLoadingRequestDetail = false)
			)
			.subscribe({
				next: (res) => {
					if (res?.isSuccess) {
						this.requestDetailData = res.data;
					} else {
						this.toast.error('Không thể lấy thông tin chi tiết yêu cầu!');
						this.onClose();
					}
				},
				error: (err) => {
					this.toast.error('Không thể lấy thông tin chi tiết yêu cầu!');
					this.onClose();
				}
			});
	}

	// Get request type from data
	getRequestType(): string | null {
		return this.requestDetailData?.type || this.requestDetailData?.requestType || null;
	}

	// Get request type icon
	getRequestTypeIcon(requestType: string): string {
		switch (requestType) {
			case 'CREATE': return 'fas fa-plus-circle';
			case 'UPDATE': return 'fas fa-edit';
			case 'DELETE': return 'fas fa-trash-alt';
			default: return 'fas fa-info-circle';
		}
	}

	// Get request type color
	getRequestTypeColor(requestType: string): string {
		switch (requestType) {
			case 'CREATE': return 'text-success';
			case 'UPDATE': return 'text-warning';
			case 'DELETE': return 'text-danger';
			default: return 'text-primary';
		}
	}

	// Get request type badge class
	getRequestTypeBadgeClass(requestType: string): string {
		switch (requestType) {
			case 'CREATE': return 'badge bg-success';
			case 'UPDATE': return 'badge bg-warning';
			case 'DELETE': return 'badge bg-danger';
			default: return 'badge bg-primary';
		}
	}

	// Get request type label
	getRequestTypeLabel(requestType: string): string {
		switch (requestType) {
			case 'CREATE': return 'Tạo mới';
			case 'UPDATE': return 'Cập nhật';
			case 'DELETE': return 'Xóa';
			default: return 'Không xác định';
		}
	}

	// Get created by
	getCreatedBy(): string {
		return this.requestDetailData?.createdBy || this.requestDetailData?.requestedBy || '';
	}

	// Get created date
	getCreatedDate(): string {
		return this.requestDetailData?.createdDate || this.requestDetailData?.requestedDate || '';
	}

	// Get user name from data
	getUserName(data: any): string {
		return data?.userName || data?.fullName || '';
	}

	// Get user name for display (prioritize fullName over userName)
	getDisplayName(data: any): string {
		return data?.fullName || data?.userName || '';
	}

	// Get user email from data
	getUserEmail(data: any): string {
		return data?.email || '';
	}

	// Get user full name from data
	getUserFullName(data: any): string {
		return data?.fullName || '';
	}

	// Get branch name from data
	getBranchName(data: any): string {
		return data?.branchName || '';
	}

	// Get user status from data
	getUserStatus(data: any): boolean {
		return data?.isActive || false;
	}

	// Get user status text
	getUserStatusText(data: any): string {
		return this.getUserStatus(data) ? 'Hoạt động' : 'Không hoạt động';
	}

	// Get user status icon
	getUserStatusIcon(data: any): string {
		return this.getUserStatus(data) ? 'fas fa-check-circle text-success' : 'fas fa-times-circle text-danger';
	}

	// Check if field has changes (for UPDATE requests)
	hasChanges(fieldName: string): boolean {
		if (!this.requestDetailData?.oldData || !this.requestDetailData?.newData) {
			return false;
		}

		const oldValue = this.requestDetailData.oldData[fieldName];
		const newValue = this.requestDetailData.newData[fieldName];
		
		return oldValue !== newValue;
	}

	// Reset all states
	private resetStates(): void {
		this.requestDetailData = null;
		this.isLoadingRequestDetail = false;
		this.hasLoadedForCurrentRequest = false;
	}
}
