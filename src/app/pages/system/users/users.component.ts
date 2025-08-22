import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastService } from 'angular-toastify';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DEFAULT_PER_PAGE_OPTIONS } from 'src/app/core/constants/shared.constant';
import { SystemService } from 'src/app/core/services/system.service';
import { UserService } from './user.service';
import { PagingState, UserItem } from './user.models';

@Component({
	selector: 'app-users',
	templateUrl: './users.component.html',
	styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, OnDestroy {

	DEFAULT_PER_PAGE_OPTIONS = DEFAULT_PER_PAGE_OPTIONS;
	breadCrumbItems = [
		{ label: 'Quản trị hệ thống' },
		{ label: 'Quản lý người sử dụng', active: true }
	];

	isLoadingList = false;
	items: UserItem[] = [];
	branches: { id: number; name: string }[] = [];

	pagingState: PagingState = {
		pageIndex: 1,
		pageSize: 10,
		totalPages: 0,
		totalItems: 0,
		keyword: '',
		isLocked: null,
		branchId: null
	};

	private destroyed$ = new Subject<void>();

	constructor(
		private userService: UserService,
		private systemService: SystemService,
		private toast: ToastService,
	) {}

    ngOnInit(): void {
		this.loadBranches();
		this.getItems();
	}

	ngOnDestroy(): void {
		this.destroyed$.next();
		this.destroyed$.complete();
	}

	getItems(): void {
		this.isLoadingList = true;
		this.userService.getUsers({
			pageIndex: this.pagingState.pageIndex,
			pageSize: this.pagingState.pageSize,
			keyword: this.pagingState.keyword || null,
			branchId: this.pagingState.branchId,
			isLocked: this.pagingState.isLocked,
		})
		.pipe(finalize(() => this.isLoadingList = false), takeUntil(this.destroyed$))
		.subscribe({
			next: (res) => {
				if (res?.isSuccess) {
					const { items, totalItems, totalPages, pageIndex, pageSize } = res.data ?? {};
					this.items = items ?? [];
					this.pagingState = {
						...this.pagingState,
						pageIndex: pageIndex ?? this.pagingState.pageIndex,
						pageSize: pageSize ?? this.pagingState.pageSize,
						totalItems: totalItems ?? 0,
						totalPages: totalPages ?? 0,
					};
				} else {
					this.items = [];
					this.toast.error('Không lấy được danh sách người dùng!');
				}
			},
			error: (err) => {
				this.items = [];
				this.toast.error('Đã xảy ra lỗi khi lấy danh sách người dùng!');
				console.error('getUsers error:', err);
			}
		});
	}

	search(): void {
		this.pagingState.pageIndex = 1;
		this.getItems();
	}

	onPageChange(page: number): void {
		if (page === this.pagingState.pageIndex) return;
		this.pagingState.pageIndex = page;
		this.getItems();
	}

	onPageSizeChange(size: number): void {
		this.pagingState.pageSize = size;
		this.pagingState.pageIndex = 1;
		this.getItems();
	}

	private loadBranches(): void {
		this.systemService.getBranchesPaging({ pageIndex: 1, pageSize: 1000 })
			.pipe(takeUntil(this.destroyed$))
			.subscribe({
				next: (res) => {
					if (res?.isSuccess) {
						this.branches = (res.data?.items ?? []).map((b: any) => ({ id: b.id, name: b.name }));
					}
				},
				error: () => {}
			});
	}
}


