import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastService } from 'angular-toastify';
import { forkJoin, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { SystemService } from 'src/app/core/services/system.service';
import { UserService } from './user.service';
import { UserItem } from './user.models';
import { USER_CONFIG } from './user.config';
import { UserFilter } from './user.models';
import { EntityListComponent } from 'src/app/core/components/base/entity-list.component';

@Component({
	selector: 'app-users',
	templateUrl: './user.component.html',
	styleUrls: ['./user.component.scss']
})

export class UsersComponent extends EntityListComponent<UserFilter> implements OnInit, OnDestroy {

	CONFIG = USER_CONFIG;

	branches: { id: number; name: string }[] = [];

	constructor(
		private userService: UserService,
		private systemService: SystemService,
		private toast: ToastService,
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

	ngOnDestroy(): void {
		this.cleanup();
	}

	// Implement method abstract base
	public onSearch(): void {
		if (this.activeTabId === 'approved') {
			this.loadData<UserItem>(this.userService.getUsers(this.getCleanSearchParams()));
		} else {
			this.loadData<any>(this.userService.getPendingUserRequests(this.getCleanSearchParams()));
		}
	}


	openCreateModal(): void {
		console.log('openCreateModal');
		super.openCreateModal();
	}

	openDetailModal(user: UserItem): void {
		console.log('Opening detail modal for user:', user);
		super.openDetailModal(user);
		console.log('Modal state:', { showDetailModal: this.showDetailModal, selectedItem: this.selectedItem });
	}

	openEditModal(user: UserItem): void {
		console.log('openEditModal', user);
		super.openEditModal(user);
	}

	openDeleteModal(user: UserItem): void {
		console.log('openDeleteModal', user);
		super.openDeleteModal(user);
	}

	// Pending request methods
	openPendingDetailModal(request: any): void {
		console.log('openPendingDetailModal', request);
	}

	openApproveModal(request: any): void {
		console.log('openApproveModal', request);
	}

	openRejectModal(request: any): void {
		console.log('openRejectModal', request);
	}

	// Modal methods
	onDetailModalClose(): void {
		super.onDetailModalClose();
	}
}