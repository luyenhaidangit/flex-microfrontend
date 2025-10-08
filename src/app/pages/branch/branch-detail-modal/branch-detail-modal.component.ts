import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { ToastService } from 'angular-toastify';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { BranchService } from '../branch.service';

@Component({
	selector: 'app-user-detail-modal',
	templateUrl: './user-detail-modal.component.html',
	styleUrls: ['./user-detail-modal.component.scss']
})
export class UserDetailModalComponent implements OnInit, OnDestroy, OnChanges {
	@Input() isVisible = false;
	@Input() user: any | null = null;
	@Output() close = new EventEmitter<void>();

	selectedItem: any | null = null;
	changeHistory: any[] = [];
	isLoadingHistory = false;
	isLoadingUserDetail = false;

	private destroy$ = new Subject<void>();

	constructor(
		private userService: BranchService,
		private toast: ToastService
	) {}

	ngOnInit(): void {
	}

	ngOnChanges(changes: SimpleChanges): void {		
		// Check if user input changed and modal is visible
		if (changes['user'] && this.isVisible && this.user) {
			this.loadUserDetail();
		}
		
		// Check if modal visibility changed
		if (changes['isVisible'] && this.isVisible && this.user) {
			this.loadUserDetail();
		}
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	onClose(): void {
		this.close.emit();
		this.resetStates();
	}

	// Load detailed user information
	private loadUserDetail(): void {
		if (!this.user?.userName) {
			this.toast.error('Không tìm thấy thông tin người dùng!');
			this.onClose();
			return;
		}

		this.isLoadingUserDetail = true;
		this.changeHistory = [];
		this.selectedItem = null;

		this.userService.getBranchRequestDetail(this.user.userName)
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => this.isLoadingUserDetail = false)
			)
			.subscribe({
				next: (res) => {
					if (res?.isSuccess) {
						this.selectedItem = res.data;
					} else {
						this.toast.error('Không thể lấy thông tin chi tiết người dùng!');
						this.onClose();
					}
				},
				error: (err) => {
					this.toast.error('Không thể lấy thông tin chi tiết người dùng!');
					this.onClose();
				}
			});
	}

	// Load change history when history tab is opened
	loadChangeHistory(): void {
		if (!this.selectedItem?.userName) {
			this.toast.error('Không tìm thấy username người dùng!');
			return;
		}

		// Only load if not already loaded
		if (this.changeHistory.length > 0) {
			return;
		}

		this.isLoadingHistory = true;
		this.userService.getBranchChangeHistory(this.selectedItem.userName)
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => this.isLoadingHistory = false)
			)
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

	// Reset all states
	private resetStates(): void {
		this.selectedItem = null;
		this.changeHistory = [];
		this.isLoadingUserDetail = false;
		this.isLoadingHistory = false;
	}
}
