import { Component, OnInit, OnDestroy } from '@angular/core';
import { IssuerService } from './issuer.service';
import { UserItem } from './issuer.models';
import { ISSUER_CONFIG } from './issuer.config';
import { IssuerFilter, IssuerItem } from './issuer.models';
import { EntityListComponent } from 'src/app/core/components/base/entity-list.component';

@Component({
	selector: 'app-issuers',
	templateUrl: './issuer.component.html',
	styleUrls: ['./issuer.component.scss']
})

export class IssuersComponent extends EntityListComponent<IssuerFilter, IssuerItem> implements OnInit, OnDestroy {

	// Config
	CONFIG = ISSUER_CONFIG;
	
	// Base
	// Properties
	state: any = this.state;
	activeTabId: any = this.activeTabId;
	selectedRequest: any = this.selectedRequest;
	showRequestDetailModal = false;
	searchInputValue: string = '';

	// Functions
	onTabChange(tabId: string): void {
		// Reset giá trị input khi đổi tab
		this.searchInputValue = '';
		super.onTabChange(tabId);
	}
	openCreateModal(): void { super.openCreateModal(); }
	openDetailModal(issuer: IssuerItem): void { super.openDetailModal(issuer); }
	openEditModal(issuer: IssuerItem): void { super.openEditModal(issuer); }
	openDeleteModal(issuer: IssuerItem): void { super.openDeleteModal(issuer); }
	
	// Constructor
	constructor(
		private issuerService: IssuerService
	) {
		var filter = { keyword: '', type: null };
		super(filter);
		this.searchInputValue = filter.keyword || '';
	}

	// Lifecycle
    ngOnInit(): void {
		this.searchInputValue = this.state.filter.keyword || '';
		super.ngOnInit();
	}
	ngOnDestroy(): void { this.cleanup(); }
	
	/**
	 * Method được gọi khi user bấm nút "Tìm kiếm" hoặc nhấn Enter
	 * Commit giá trị từ input vào filter và apply filter
	 */
	public onSearchClick(): void {
		// Chỉ set filter value nếu giá trị thay đổi
		if (this.state.filter.keyword !== this.searchInputValue) {
			this.setFilterValue('keyword', this.searchInputValue);
		}
		// Apply filter (clear dirty flag, reset page, và gọi onSearch())
		this.applyFilter();
	}
	
	/**
	 * Method được gọi khi giá trị input thay đổi (optional - để mark dirty ngay khi user nhập)
	 * Có thể bind vào (ngModelChange) nếu muốn mark dirty ngay khi nhập
	 */
	public onSearchInputChange(): void {
		// So sánh với filter hiện tại để đánh dấu dirty
		if (this.state.filter.keyword !== this.searchInputValue) {
			this.isDirtyFilter = true;
		} else {
			this.isDirtyFilter = false;
		}
	}
	
	// Implement method abstract base
	public onSearch(): void {
		// Load data với filter hiện tại (đã được apply)
		if (this.activeTabId === 'approved') {
			this.loadData<UserItem>(this.issuerService.getIssuers(this.getCleanSearchParams()));
		} else {
			this.loadData<any>(this.issuerService.getPendingIssuerRequests(this.getCleanSearchParams()));
		}
	}
	
	// Pending request methods
	openPendingDetailModal(request: any): void {
		this.selectedRequest = request;
		this.showRequestDetailModal = true;
	}
	
	openApproveModal(request: any): void {
		this.selectedRequest = request;
		super.openApproveModal(request);
	}
	
	openRejectModal(request: any): void {
		console.log('openRejectModal', request);
		this.selectedRequest = request;
		super.openRejectModal(request);
	}
	
	// Handle approve success
	onUserApproved(result: any): void {
		console.log('User request approved:', result);
		super.onApproveModalClose();
		this.onSearch();
	}

	onApproveModalClose(): void {
		super.onApproveModalClose();
	}
	
	// Handle reject success
	onUserRejected(result: any): void {
		console.log('User request rejected:', result);
		super.onRejectModalClose();
		this.onSearch();
	}

	onRejectModalClose(): void {
		super.onRejectModalClose();
	}
	
	// Modal methods
	onDetailModalClose(): void {
		super.onDetailModalClose();
	}
	
	onCreateModalClose(): void {
		super.onCreateModalClose();
	}
	
	onUserCreated(): void {
		super.onCreateModalClose();
		// Reload data after user is created
		this.onSearch();
	}
	
	onEditModalClose(): void {
		super.onEditModalClose();
	}
	
	onUserUpdated(): void {
		super.onEditModalClose();
		// Reload data after user is updated
		this.onSearch();
	}
	
	onDeleteModalClose(): void {
		super.onDeleteModalClose();
	}
	
	onUserDeleted(): void {
		super.onDeleteModalClose();
		// Reload data after user delete request is sent
		this.onSearch();
	}
	
	// Request detail modal methods
	onRequestDetailModalClose(): void {
		this.showRequestDetailModal = false;
		this.selectedRequest = null;
	}
}
