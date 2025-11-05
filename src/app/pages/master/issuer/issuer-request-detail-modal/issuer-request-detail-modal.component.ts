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
	approvedBy?: string;
	approvedDate?: string;
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
	expandedSecurities: Set<number> = new Set();

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

	// Get organization type from data
	getOrganizationType(data: any): string {
		return data?.organizationType || data?.orgType || 'Doanh nghiệp phát hành';
	}

	// Get registration date from data
	getRegistrationDate(data: any): string {
		return data?.registrationDate || data?.registeredDate || this.getCreatedDate();
	}

	// Get status text
	getStatusText(): string {
		const status = this.requestDetailData?.status || '';
		switch (status?.toUpperCase()) {
			case 'PENDING': return 'Pending';
			case 'APPROVED': return 'Đã phê duyệt';
			case 'REJECTED': return 'Đã từ chối';
			default: return 'Pending';
		}
	}

	// Get approval workflow steps
	getWorkflowSteps(): Array<{label: string, status: 'completed' | 'current' | 'pending', date?: string, user?: string}> {
		const status = (this.requestDetailData?.status || 'PENDING').toUpperCase();
		const createdDate = this.getCreatedDate();
		const approvedDate = this.requestDetailData?.approvedDate || this.requestDetailData?.rejectedDate || '';
		const rejectedDate = this.requestDetailData?.rejectedDate || '';
		const approvedBy = this.requestDetailData?.approvedBy || this.requestDetailData?.rejectedBy || '';
		const rejectedBy = this.requestDetailData?.rejectedBy || '';

		let steps: Array<{label: string, status: 'completed' | 'current' | 'pending', date?: string, user?: string}>;

		if (status === 'PENDING') {
			steps = [
				{
					label: 'Yêu cầu tạo',
					status: 'completed' as const,
					date: createdDate,
					user: this.getCreatedBy()
				},
				{
					label: 'Chờ duyệt',
					status: 'current' as const,
					date: undefined,
					user: undefined
				},
				{
					label: 'Kết quả duyệt',
					status: 'pending' as const,
					date: undefined,
					user: undefined
				}
			];
		} else if (status === 'APPROVED') {
			steps = [
				{
					label: 'Tạo yêu cầu',
					status: 'completed' as const,
					date: createdDate,
					user: this.getCreatedBy()
				},
				{
					label: 'Chờ duyệt',
					status: 'completed' as const,
					date: approvedDate || createdDate,
					user: approvedBy
				},
				{
					label: 'Đã phê duyệt',
					status: 'completed' as const,
					date: approvedDate,
					user: approvedBy
				}
			];
		} else if (status === 'REJECTED') {
			steps = [
				{
					label: 'Tạo yêu cầu',
					status: 'completed' as const,
					date: createdDate,
					user: this.getCreatedBy()
				},
				{
					label: 'Chờ duyệt',
					status: 'completed' as const,
					date: rejectedDate || createdDate,
					user: rejectedBy
				},
				{
					label: 'Đã từ chối',
					status: 'completed' as const,
					date: rejectedDate,
					user: rejectedBy
				}
			];
		} else {
			steps = [
				{
					label: 'Tạo yêu cầu',
					status: 'completed' as const,
					date: createdDate,
					user: this.getCreatedBy()
				},
				{
					label: 'Chờ duyệt',
					status: 'current' as const,
					date: undefined,
					user: undefined
				},
				{
					label: 'Kết quả duyệt',
					status: 'pending' as const,
					date: undefined,
					user: undefined
				}
			];
		}

		return steps;
	}

	// Get step icon class
	getStepIconClass(stepStatus: 'completed' | 'current' | 'pending'): string {
		switch (stepStatus) {
			case 'completed': return 'fas fa-check-circle text-success';
			case 'current': return 'fas fa-clock text-warning';
			case 'pending': return 'far fa-circle text-muted';
			default: return 'far fa-circle text-muted';
		}
	}

	// Get step badge class
	getStepBadgeClass(stepStatus: 'completed' | 'current' | 'pending'): string {
		switch (stepStatus) {
			case 'completed': return 'badge bg-success';
			case 'current': return 'badge bg-warning';
			case 'pending': return 'badge bg-secondary';
			default: return 'badge bg-secondary';
		}
	}

	// Get securities list from data
	getSecuritiesList(data: any): any[] {
		return data?.securities || [];
	}

	// Get securities code
	getSecuritiesCode(securities: any): string {
		return securities?.securitiesCode || securities?.code || '';
	}

	// Get securities symbol/name
	getSecuritiesSymbol(securities: any): string {
		return securities?.symbol || securities?.name || '';
	}

	// Get securities ISIN code
	getSecuritiesIsinCode(securities: any): string {
		return securities?.isinCode || '';
	}

	// Get securities type/domain display name
	getSecuritiesType(securities: any): string {
		const domainCode = securities?.domainCode || '';
		// Map domain codes to securities types if needed
		if (domainCode.includes('BOND') || domainCode.includes('TP')) return 'Trái phiếu';
		if (domainCode.includes('STOCK') || domainCode.includes('CP')) return 'Cổ phiếu';
		if (domainCode.includes('FUND') || domainCode.includes('CCQ')) return 'Chứng chỉ quỹ';
		return domainCode || '—';
	}

	// Get securities face value
	getSecuritiesFaceValue(securities: any): string {
		if (securities?.faceValue !== undefined && securities?.faceValue !== null) {
			return new Intl.NumberFormat('vi-VN').format(securities.faceValue);
		}
		return '—';
	}

	// Get securities listing date
	getSecuritiesListingDate(securities: any): string {
		return securities?.listingDate || securities?.issueDate || '';
	}

	// Get display name for securities (code - name)
	getSecuritiesDisplayName(securities: any): string {
		const code = this.getSecuritiesCode(securities);
		const symbol = this.getSecuritiesSymbol(securities);
		if (code && symbol) {
			return `${code} – ${symbol}`;
		}
		return code || symbol || '';
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

	// Toggle securities expansion
	toggleSecurities(index: number): void {
		if (this.expandedSecurities.has(index)) {
			this.expandedSecurities.delete(index);
		} else {
			this.expandedSecurities.add(index);
		}
	}

	// Check if securities is expanded
	isSecuritiesExpanded(index: number): boolean {
		return this.expandedSecurities.has(index);
	}

	// Reset all states
	private resetStates(): void {
		this.requestDetailData = null;
		this.isLoadingRequestDetail = false;
		this.hasLoadedForCurrentRequest = false;
		this.expandedSecurities.clear();
	}
}
