import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { ToastService } from 'angular-toastify';
import { forkJoin } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { IssuerService } from './issuer.service';
import { UserItem } from './issuer.models';
import { USER_CONFIG as ISSUER_CONFIG } from './issuer.config';
import { IssuerFilter, IssuerItem } from './issuer.models';
import { EntityListComponent } from 'src/app/core/components/base/entity-list.component';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
	selector: 'app-issuers',
	templateUrl: './issuer.component.html',
	styleUrls: ['./issuer.component.scss']
})

export class IssuersComponent extends EntityListComponent<IssuerFilter, IssuerItem> implements OnInit, OnDestroy {

	// Config
	CONFIG = ISSUER_CONFIG;
	
	// Base
	selectedRequest: any = this.selectedRequest;
	showRequestDetailModal = false;
	
	constructor(
		private issuerService: IssuerService,
		private toast: ToastService,
		private modalService: BsModalService
	) {
		super({ keyword: '', type: null });
	}
	
	ngOnInit(): void {		
		this.loadingTable = true;
		
    	const usersCall = (this.issuerService as any).getIssuers(this.getCleanSearchParams());
		
		// Load branches and users in parallel
		forkJoin({
			users: usersCall
		}).pipe(
			takeUntil(this.destroy$),
			finalize(() => {
				this.loadingTable = false;
			})
		).subscribe({
			next: ({ users }) => {
				
        // Handle users
        const u: any = users as any;
        if (u?.isSuccess) {
          const { items, pageMeta } = this.extractPagingFromResponse<UserItem>(u.data);
          this.items = items as UserItem[];
          this.updatePagingState(pageMeta);
        } else {
          this.items = [];
        }
			},
			error: (err) => {
				this.items = [];
			}
		});
	}
	
  ngOnDestroy(): void { this.cleanup(); }
	
	// Implement method abstract base
	public onSearch(): void {
    if (this.activeTabId === 'approved') {
      this.loadData<UserItem>((this.issuerService as any).getIssuers(this.getCleanSearchParams()));
    } else {
      this.loadData<any>((this.issuerService as any).getPendingIssuerRequests(this.getCleanSearchParams()));
    }
	}
	
	onTabChange(tabId: string): void {
		this.activeTabId = tabId;
		this.onSearch();
	}
	
	
	openCreateModal(): void {
		super.openCreateModal();
	}
	
	openDetailModal(user: UserItem): void {
		super.openDetailModal(user);
	}
	
	openEditModal(user: UserItem): void {
		super.openEditModal(user);
	}
	
	openDeleteModal(user: UserItem): void {
		super.openDeleteModal(user);
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
