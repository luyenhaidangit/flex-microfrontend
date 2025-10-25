import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { ToastService } from 'angular-toastify';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { IssuerService } from '../issuer.service';

export interface IssuerRequestDetailData {
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
	selector: 'app-issuer-request-detail-modal',
	templateUrl: './issuer-request-detail-modal.component.html',
	styleUrls: ['./issuer-request-detail-modal.component.scss']
})
export class IssuerRequestDetailModalComponent implements OnInit, OnDestroy, OnChanges {
	@Input() isVisible = false;
	@Input() selectedRequest: any = null;
	@Output() close = new EventEmitter<void>();

	requestDetailData: IssuerRequestDetailData | null = null;
	isLoadingRequestDetail = false;
	private hasLoadedForCurrentRequest = false;

	private destroy$ = new Subject<void>();

	constructor(
		private issuerService: IssuerService,
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

		this.issuerService.getPendingIssuerRequestById(this.selectedRequest.requestId)
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

	// Get issuer code from data
	getIssuerCode(data: any): string {
		return data?.issuerCode || '';
	}

	// Get issuer short name from data
	getIssuerShortName(data: any): string {
		return data?.shortName || '';
	}

	// Get issuer full name from data
	getIssuerFullName(data: any): string {
		return data?.fullName || '';
	}

	// Get issuer name for display (prioritize fullName over shortName)
	getDisplayName(data: any): string {
		return data?.fullName || data?.shortName || '';
	}

	// Get issuer status from data
	getIssuerStatus(data: any): string {
		return data?.status || '';
	}

	// Get issuer status text
	getIssuerStatusText(data: any): string {
		const status = this.getIssuerStatus(data);
		switch (status) {
			case 'AUTHORISED': return 'Đã phê duyệt';
			case 'UNAUTHORISED': return 'Chờ phê duyệt';
			case 'REJECTED': return 'Đã từ chối';
			default: return 'Không xác định';
		}
	}

	// Get issuer status icon
	getIssuerStatusIcon(data: any): string {
		const status = this.getIssuerStatus(data);
		switch (status) {
			case 'AUTHORISED': return 'fas fa-check-circle text-success';
			case 'UNAUTHORISED': return 'fas fa-clock text-warning';
			case 'REJECTED': return 'fas fa-times-circle text-danger';
			default: return 'fas fa-question-circle text-muted';
		}
	}

	// Get comment from data
	getComment(data: any): string {
		return data?.comment || '';
	}

	// Get reason from data (for delete requests)
	getReason(data: any): string {
		return data?.reason || '';
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
