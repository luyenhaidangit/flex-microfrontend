import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastService } from 'angular-toastify';
import { forkJoin, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { SystemService } from 'src/app/core/services/system.service';
import { UserService } from './user.service';
import { UserItem } from './user.models';
import { USER_CONFIG, getTableColumns, getSkeletonConfig } from './user.config';
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

	isLoadingList = false;
	items: UserItem[] = [];
	branches: { id: number; name: string }[] = [];

	// Table configuration
	tableColumns = getTableColumns();
	skeletonConfig = getSkeletonConfig();

	// Loading state
	loading = false;

	// Destroy subject for cleanup
	private destroy$ = new Subject<void>();

	// Get search params
	get searchParams(): any {
		const params = {
			pageIndex: this.state.paging.index,
			pageSize: this.state.paging.size,
			keyword: this.state.filter.keyword,
			branchId: this.state.filter.branchId,
			isActive: this.state.filter.isActive,
			status: this.activeTabId
		};
		
		return this.cleanParams(params);
	}

	constructor(
		private userService: UserService,
		private systemService: SystemService,
		private toast: ToastService,
	) {
		super({ keyword: '', branchId: null, isActive: null, type: null });
		console.log('🏗️ Constructor được gọi');
		console.log('🔧 Services injected:', { 
			userService: !!this.userService, 
			systemService: !!this.systemService,
			toast: !!this.toast 
		});
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

	onsearch(): void {
		if (this.activeTabId === 'approved') {
			this.getItems();
		} else {
			this.getPendingItems();
		}
	}

	getPendingItems(): void {
	}

	// Tab handling methods
	onTabChange(tabId: string): void {
		this.activeTabId = tabId;
		this.resetToFirstPage(); // Sử dụng method từ base class
		this.getItems();
	}

	onTabChanged(tab: any): void {
		console.log('Tab changed to:', tab);
		// Có thể thêm logic xử lý khác ở đây nếu cần
	}

	getItems(): void {
		this.isLoadingList = true;
		this.userService.getUsers(this.searchParams)
		.pipe(
			finalize(() => this.isLoadingList = false),
			takeUntil(this.destroy$)
		)
		.subscribe({
			next: (res: any) => {
				if (res?.isSuccess) {
					// Sử dụng method từ base class
					const { items, pageMeta } = this.extractPagingFromResponse<UserItem>(res.data);
					this.items = items as UserItem[];
					
					// Cập nhật trạng thái phân trang
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

	handlePageChange(page: number): void {
		this.onPageChange(page, () => this.getItems());
	}

	handlePageSizeChange(size: number): void {
		this.onPageSizeChange(size, () => this.getItems());
	}

	// ---------------- Internals ----------------
}


