import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { ToastService } from 'angular-toastify';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { BranchService } from '../branch.service';
import { getBranchTypeLabel } from '../branch.helper';

@Component({
	selector: 'app-branch-detail-modal',
	templateUrl: './branch-detail-modal.component.html',
	styleUrls: ['./branch-detail-modal.component.scss']
})
export class BranchDetailModalComponent implements OnInit, OnDestroy, OnChanges {
	@Input() isVisible = false;
	@Input() branch: any | null = null;
	@Output() close = new EventEmitter<void>();

	selectedItem: any | null = null;
	changeHistory: any[] = [];
	isLoadingHistory = false;
	isLoadingBranchDetail = false;

	private destroy$ = new Subject<void>();

	// Helper method for branch type label
	public getBranchTypeLabel = getBranchTypeLabel;

	constructor(
		private branchService: BranchService,
		private toast: ToastService
	) {}

	ngOnInit(): void {
	}

	ngOnChanges(changes: SimpleChanges): void {		
		// Check if branch input changed and modal is visible
		if (changes['branch'] && this.isVisible && this.branch) {
			this.loadBranchDetail();
		}
		
		// Check if modal visibility changed
		if (changes['isVisible'] && this.isVisible && this.branch) {
			this.loadBranchDetail();
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

	// Load detailed branch information
	private loadBranchDetail(): void {
		if (!this.branch?.code) {
			this.toast.error('Không tìm thấy mã chi nhánh!');
			this.onClose();
			return;
		}

		this.isLoadingBranchDetail = true;
		this.changeHistory = [];
		this.selectedItem = null;

		this.branchService.getApprovedBranchByCode(this.branch.code)
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => this.isLoadingBranchDetail = false)
			)
			.subscribe({
				next: (res) => {
					if (res?.isSuccess) {
						this.selectedItem = res.data;
					} else {
						this.toast.error('Không thể lấy thông tin chi tiết chi nhánh!');
						this.onClose();
					}
				},
				error: (err) => {
					this.toast.error('Không thể lấy thông tin chi tiết chi nhánh!');
					this.onClose();
				}
			});
	}

	// Load change history when history tab is opened
	loadChangeHistory(): void {
		if (!this.selectedItem?.code) {
			this.toast.error('Không tìm thấy mã chi nhánh!');
			return;
		}

		// Only load if not already loaded
		if (this.changeHistory.length > 0) {
			return;
		}

		this.isLoadingHistory = true;
		this.branchService.getBranchChangeHistory(this.selectedItem.code)
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
		this.isLoadingBranchDetail = false;
		this.isLoadingHistory = false;
	}
}
