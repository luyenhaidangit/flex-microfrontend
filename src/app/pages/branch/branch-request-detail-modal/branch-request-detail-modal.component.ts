import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { ToastService } from 'angular-toastify';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { BranchService } from '../branch.service';
import { getBranchTypeLabel } from '../branch.helper';

export interface BranchRequestDetailData {
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
	selector: 'app-branch-request-detail-modal',
	templateUrl: './branch-request-detail-modal.component.html',
	styleUrls: ['./branch-request-detail-modal.component.scss']
})
export class BranchRequestDetailModalComponent implements OnInit, OnDestroy, OnChanges {
	@Input() isVisible = false;
	@Input() selectedRequest: any = null;
	@Output() close = new EventEmitter<void>();

	requestDetailData: BranchRequestDetailData | null = null;
	isLoadingRequestDetail = false;
	private hasLoadedForCurrentRequest = false;

	private destroy$ = new Subject<void>();

	// Helper method for branch type label
	public getBranchTypeLabel = getBranchTypeLabel;

	constructor(
		private branchService: BranchService,
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

		this.branchService.getBranchRequestDetail(this.selectedRequest.requestId)
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

	// Get branch code from data
	getBranchCode(data: any): string {
		return data?.code || data?.branchCode || '';
	}

	// Get branch name from data
	getBranchName(data: any): string {
		return data?.name || data?.branchName || '';
	}

	// Get branch type from data
	getBranchType(data: any): number {
		return data?.branchType || data?.type || 1;
	}

	// Get branch description from data
	getBranchDescription(data: any): string {
		return data?.description || '';
	}

	// Get branch status from data
	getBranchStatus(data: any): boolean {
		return data?.isActive === true || data?.isActive === 'Y' || data?.isActive === 'true';
	}

	// Get branch status text
	getBranchStatusText(data: any): string {
		return this.getBranchStatus(data) ? 'Hoạt động' : 'Không hoạt động';
	}

	// Get branch status icon
	getBranchStatusIcon(data: any): string {
		return this.getBranchStatus(data) ? 'fas fa-check-circle text-success' : 'fas fa-times-circle text-danger';
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
