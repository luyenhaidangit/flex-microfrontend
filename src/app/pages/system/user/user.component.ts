import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { ToastService } from 'angular-toastify';
import { forkJoin, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
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

	// Modal properties
	@ViewChild('detailModal') detailModalTemplateRef!: TemplateRef<any>;
	modalRef?: BsModalRef | null = null;
	changeHistory: any[] = [];
	isLoadingHistory = false;


	// Override getSearchParams to include branchId
	protected getSearchParams(): any {
		return {
			pageIndex: this.state.paging.index,
			pageSize: this.state.paging.size,
			keyword: this.state.filter.keyword,
			branchId: this.state.filter.branchId,
			status: this.activeTabId
		};
	}

	constructor(
		private userService: UserService,
		private systemService: SystemService,
		private toast: ToastService,
		private modalService: BsModalService,
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
		// Close modal if open
		if (this.modalRef) {
			this.modalRef.hide();
		}
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
	}

	openDetailModal(user: UserItem): void {
		// Reset change history when opening modal
		this.changeHistory = [];
		this.selectedItem = null;
		
		this.modalRef = this.modalService.show(this.detailModalTemplateRef, { 
			class: 'modal-xl',
			backdrop: 'static',
			keyboard: false, 
		});
		
		// Call API to get detailed user information
		this.userService.getUserByUsername(user.userName).subscribe({
			next: (res) => {
				if (res?.isSuccess) {
					this.selectedItem = res.data;
				} else {
					this.closeModal();
				}
			},
			error: (err) => {
				this.closeModal();
			}
		});
	}

	openEditModal(user: UserItem): void {
		console.log('openEditModal', user);
	}

	openDeleteModal(user: UserItem): void {
		console.log('openDeleteModal', user);
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
	closeModal(): void {
		if (this.modalRef) {
			this.modalRef.hide();
			this.modalRef = null;
			this.selectedItem = null;
		}
	}

	// Load change history when history tab is opened
	loadChangeHistory(): void {
		if (!this.selectedItem?.id) {
			this.toast.error('Không tìm thấy ID người dùng!');
			return;
		}

		// Only load if not already loaded
		if (this.changeHistory.length > 0) {
			return;
		}

		this.isLoadingHistory = true;
		this.userService.getUserChangeHistory(this.selectedItem.id)
			.pipe(finalize(() => this.isLoadingHistory = false))
			.subscribe({
				next: (res) => {
					if (res?.isSuccess) {
						this.changeHistory = res.data || [];
					} else {
						this.changeHistory = [];
						this.toast.error('Không thể lấy lịch sử thay đổi!');
					}
				},
				error: (err) => {
					this.changeHistory = [];
					this.toast.error('Không thể lấy lịch sử thay đổi!');
				}
			});
	}
}