import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastService } from 'angular-toastify';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { SystemService } from 'src/app/core/services/system.service';
import { UserService } from './user.service';
import { PagingState, UserItem } from './user.models';
import { USER_CONFIG, getUserStatusConfig, getTableColumns, getSkeletonConfig } from './user.config';
import { Query, ListState, PageMeta  } from 'src/app/core/features/query';
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

	state: ListState<UserFilter> = Query.init(
	  { keyword: '', branchId: null, isLocked: null },
      { index: 1, size: 10 }
	);

	// Table configuration
	tableColumns = getTableColumns();
	skeletonConfig = getSkeletonConfig();

	private destroyed$ = new Subject<void>();

	constructor(
		private userService: UserService,
		private systemService: SystemService,
		private toast: ToastService,
	) {
		super({ keyword: '', branchId: null, isLocked: null, type: null });
	}

    ngOnInit(): void {
		this.getItems();
	}

	search(): void {
		this.resetToFirstPage();
		// this.getItems();
	}

	// Tab handling methods
	onTabChange(tabId: string): void {
		this.activeTabId = tabId;
		this.state.paging.index = 1;
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
		this.userService.getUsers({
			pageIndex: this.state.paging.index,
			pageSize: this.state.paging.size,
			// keyword: this.pagingState.keyword || null,
			// branchId: this.pagingState.branchId,
			// isLocked: this.pagingState.isLocked,
			// status: this.activeTabId // Thêm status dựa trên tab active
		})
		.pipe(finalize(() => this.isLoadingList = false), takeUntil(this.destroyed$))
		.subscribe({
			next: (res) => {
				if (res?.isSuccess) {
					const { items, totalItems, totalPages, pageIndex, pageSize } = res.data ?? {};
					this.items = items ?? [];
					// this.pagingState = {
					// 	...this.pagingState,
					// 	pageIndex: pageIndex ?? this.pagingState.pageIndex,
					// 	pageSize: pageSize ?? this.pagingState.pageSize,
					// 	totalItems: totalItems ?? 0,
					// 	totalPages: totalPages ?? 0,
					// };
				} else {
					this.items = [];
					this.toast.error(USER_CONFIG.messages.error.load);
				}
			},
			error: (err) => {
				this.items = [];
				this.toast.error(USER_CONFIG.messages.error.general);
				console.error('getUsers error:', err);
			}
		});
	}

	onPageChange(page: number): void {
		// if (page === this.pagingState.pageIndex) return;
		// this.pagingState.pageIndex = page;
		// this.getItems();
	}

	onPageSizeChange(size: number): void {
		// this.pagingState.pageSize = size;
		// this.pagingState.pageIndex = 1;
		// this.getItems();
	}

	// ---------------- Internals ----------------
}


