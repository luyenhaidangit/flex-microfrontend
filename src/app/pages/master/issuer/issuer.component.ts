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
	onPageChange(page: number): void {
		if (page < 1 || page > this.state.paging.totalPages || page === this.state.paging.index) return;
		this.state.paging.index = page;
		if (this.activeTabId === 'approved') {
			this.loadData<UserItem>(this.issuerService.getIssuers(this.getCleanSearchParams()));
		} else {
			this.loadData<any>(this.issuerService.getPendingIssuerRequests(this.getCleanSearchParams()));
		}
	}
	
	onPageSizeChange(pageSize?: number): void {
		if (pageSize !== undefined) {
			this.state.paging.size = pageSize;
		}
		this.state.paging.index = 1;
		if (this.activeTabId === 'approved') {
			this.loadData<UserItem>(this.issuerService.getIssuers(this.getCleanSearchParams()));
		} else {
			this.loadData<any>(this.issuerService.getPendingIssuerRequests(this.getCleanSearchParams()));
		}
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
	
	// Implement method abstract base
	public onSearch(): void {
		// Commit giá trị từ input vào filter trước khi tìm kiếm
		this.state.filter.keyword = this.searchInputValue;
		// Reset về trang 1 khi tìm kiếm
		this.state.paging.index = 1;
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
