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
	activeTabId = this.CONFIG.tabs.default;

	// Loading state
	loading = false;

	items: UserItem[] = [];
	branches: { id: number; name: string }[] = [];

	// Destroy subject for cleanup
	private destroy$ = new Subject<void>();

	// Get search params
	get searchParams(): any {
		const params = {
			pageIndex: this.state.paging.index,
			pageSize: this.state.paging.size,
			keyword: this.state.filter.keyword,
			branchId: this.state.filter.branchId,
			status: this.activeTabId
		};
		
		return this.cleanParams(params);
	}

	constructor(
		private userService: UserService,
		private systemService: SystemService,
		private toast: ToastService,
	) {
		super({ keyword: '', branchId: null, type: null });
	}

    ngOnInit(): void {
		this.loading = true;
		
		const branchesCall = this.systemService.getBranchesForFilter();
		const usersCall = this.userService.getUsers(this.cleanParams(this.searchParams));
		
		// Load branches and users in parallel
		forkJoin({
			branches: branchesCall,
			users: usersCall
		}).pipe(
			takeUntil(this.destroy$),
			finalize(() => {
				this.loading = false;
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
		console.log('🗑️ Component destroy - cleanup subscriptions');
		this.destroy$.next();
		this.destroy$.complete();
	}

	// Implement method abstract base
	public onSearch(): void {
		if (this.activeTabId === 'approved') {
			this.getItems();
		} else {
			this.getPendingItems();
		}
	}

	getItems(): void {
		console.log('getItems', this.searchParams);

		this.loading = true;
		this.userService.getUsers(this.searchParams)
		.pipe(
			finalize(() => this.loading = false),
			takeUntil(this.destroy$)
		)
		.subscribe({
			next: (res: any) => {
				if (res?.isSuccess) {
					const { items, pageMeta } = this.extractPagingFromResponse<UserItem>(res.data);
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

	getPendingItems(): void {
		console.log('getPendingItems', this.searchParams);

		this.loading = true;
		this.userService.getPendingUserRequests(this.searchParams)
		.pipe(
			finalize(() => this.loading = false),
			takeUntil(this.destroy$)
		)
		.subscribe({
			next: (res: any) => {
				if (res?.isSuccess) {
					const { items, pageMeta } = this.extractPagingFromResponse<any>(res.data);
					this.items = items;
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

	onTabChange(tabId: string): void {
		this.activeTabId = tabId;
		this.resetSearchParams();
		this.onSearch();
	}

	private resetSearchParams(): void {
		this.state.filter.keyword = '';
		this.state.filter.branchId = null;
		this.state.filter.type = null;
		this.resetToFirstPage();
	}

	openCreateModal(): void {
		console.log('openCreateModal');
	}

	openDetailModal(user: UserItem): void {
		console.log('openDetailModal', user);
	}

	openEditModal(user: UserItem): void {
		console.log('openEditModal', user);
	}

	openDeleteModal(user: UserItem): void {
		console.log('openDeleteModal', user);
	}

	// Helper methods for table display
	getTableColumns(): any[] {
		return this.CONFIG.table.columns[this.activeTabId as keyof typeof this.CONFIG.table.columns] || [];
	}

	getSkeletonRows(): number {
		return this.CONFIG.table.skeleton[this.activeTabId as keyof typeof this.CONFIG.table.skeleton]?.rows || 8;
	}

	getSkeletonColumns(): string[] {
		return this.CONFIG.table.skeleton[this.activeTabId as keyof typeof this.CONFIG.table.skeleton]?.columns || [];
	}

	getActionConfig(action: string): any {
		return this.CONFIG.action[action as keyof typeof this.CONFIG.action] || { text: action, class: 'bg-secondary', icon: 'question' };
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
}