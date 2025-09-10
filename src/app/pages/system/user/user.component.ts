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

export class UsersComponent extends EntityListComponent<UserFilter> implements OnInit, OnDestroy {

	CONFIG = USER_CONFIG;

	branches: { id: number; name: string }[] = [];
	
	@ViewChild('createUserModal') createUserModalTemplateRef!: TemplateRef<any>;
	modalRef?: BsModalRef | null = null;

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
		this.modalRef = this.modalService.show(this.createUserModalTemplateRef, {
			class: 'modal-lg',
			backdrop: 'static',
			keyboard: false
		});
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

	onCreateModalClose(): void {
		this.modalRef?.hide();
	}

	onUserCreated(): void {
		this.modalRef?.hide();
		// Reload data after user is created
		this.onSearch();
	}
}