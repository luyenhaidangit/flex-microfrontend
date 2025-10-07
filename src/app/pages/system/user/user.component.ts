import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { ToastService } from 'angular-toastify';
import { forkJoin, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { SystemService } from 'src/app/core/services/system.service';
import { UserService } from './user.service';
import { UserItem } from './user.models';
import { USER_CONFIG } from './user.config';
import { UserFilter } from './user.models';
import { EntityListComponent } from 'src/app/core/components/base/entity-list.component';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
	selector: 'app-users',
	templateUrl: './user.component.html',
	styleUrls: ['./user.component.scss']
})

export class UsersComponent extends EntityListComponent<UserFilter, UserItem> implements OnInit, OnDestroy {
	
	CONFIG = USER_CONFIG;
	
	branches: { id: number; name: string }[] = [];
	
	selectedRequest: any = null;
	showRequestDetailModal = false;
	
	constructor(
		private userService: UserService,
		private systemService: SystemService,
		private toast: ToastService,
		private modalService: BsModalService
	) {
		super({ keyword: '', branchId: null, type: null });
	}
	
	ngOnInit(): void {		
		this.loadingTable = true;
		
		const branchesCall = this.systemService.getBranchesForFilter();
		const usersCall = this.userService.getUsers(this.getCleanSearchParams());
		
		// Load branches and users in parallel
		forkJoin({
			branches: branchesCall,
			users: usersCall
		}).pipe(
			takeUntil(this.destroy$),
			finalize(() => {
				this.loadingTable = false;
			})
		).subscribe({
			next: ({ branches, users }) => {
				
				// Handle branches
				if (branches?.isSuccess) {
					this.branches = branches.data || [];
				} else {
					this.branches = [];
				}
				
				// Handle users
				if (users?.isSuccess) {
					const { items, pageMeta } = this.extractPagingFromResponse<UserItem>(users.data);
					this.items = items as UserItem[];
					this.updatePagingState(pageMeta);
				} else {
					this.items = [];
				}
			},
			error: (err) => {
				this.branches = [];
				this.items = [];
			}
		});
	}
	
  ngOnDestroy(): void { this.cleanup(); }
	
	// Implement method abstract base
	public onSearch(): void {
		if (this.activeTabId === 'approved') {
			this.loadData<UserItem>(this.userService.getUsers(this.getCleanSearchParams()));
		} else {
			this.loadData<any>(this.userService.getPendingUserRequests(this.getCleanSearchParams()));
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
