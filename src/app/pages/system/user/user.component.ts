import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastService } from 'angular-toastify';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { SystemService } from 'src/app/core/services/system.service';
import { UserService } from './user.service';
import { UserItem } from './user.models';
import { USER_CONFIG, getUserStatusConfig, getTableColumns, getSkeletonConfig } from './user.config';
import { ListState, PageMeta  } from 'src/app/core/features/query';
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

	// Triggers
	private reload$ = new Subject<void>();

	isLoadingList = false;
	items: UserItem[] = [];
	branches: { id: number; name: string }[] = [];

	// Table configuration
	tableColumns = getTableColumns();
	skeletonConfig = getSkeletonConfig();

	private destroyed$ = new Subject<void>();

	constructor(
		private userService: UserService,
		private systemService: SystemService,
		private toast: ToastService,
	) {
		super({ keyword: '', branchId: null, isActive: null, type: null });
	}

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

    ngOnInit(): void {
		this.loadBranches()
			.then(() => {
				this.getItems();
			})
			.catch((err) => {
				console.error('Không thể load branches, vẫn load users:', err);
				// Vẫn load users ngay cả khi branches fail
				this.getItems();
			});
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

	// Load branches for filter dropdown
	loadBranches(): Promise<void> {
		return new Promise((resolve, reject) => {
			this.systemService.getBranchesForFilter()
				.pipe(takeUntil(this.destroyed$))
				.subscribe({
					next: (res) => {
						if (res?.isSuccess) {
							this.branches = res.data || [];
						} else {
							this.branches = [];
							console.warn('Không thể load danh sách chi nhánh');
						}
						resolve();
					},
					error: (err) => {
						this.branches = [];
						console.error('Lỗi khi load danh sách chi nhánh:', err);
						reject(err);
					}
				});
		});
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

	ngOnDestroy(): void {
		this.destroyed$.next();
		this.destroyed$.complete();
	}

	getItems(): void {
		this.isLoadingList = true;
		this.userService.getUsers(this.searchParams)
		.pipe(finalize(() => this.isLoadingList = false), takeUntil(this.destroyed$))
		.subscribe({
			next: (res) => {
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


