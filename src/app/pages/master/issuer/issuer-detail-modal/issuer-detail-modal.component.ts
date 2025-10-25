import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { ToastService } from 'angular-toastify';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { IssuerService as UserService } from '../issuer.service';
import { IssuerItem } from '../issuer.models';

@Component({
	selector: 'app-issuer-detail-modal',
	templateUrl: './issuer-detail-modal.component.html',
	styleUrls: ['./issuer-detail-modal.component.scss']
})
export class IssuerDetailModalComponent implements OnInit, OnDestroy, OnChanges {
	@Input() isVisible = false;
	@Input() user: IssuerItem | null = null;
	@Output() close = new EventEmitter<void>();
	
	selectedItem: IssuerItem | null = null;
	changeHistory: any[] = [];
	isLoadingHistory = false;
	isLoadingUserDetail = false;
	
	private destroy$ = new Subject<void>();
	
	constructor(
		private userService: UserService,
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
		if (!this.user?.id) {
			this.toast.error('Không tìm thấy thông tin TCPH!');
			this.onClose();
			return;
		}
		
		this.isLoadingUserDetail = true;
		this.changeHistory = [];
		this.selectedItem = null;
		
		(this.userService as any).getIssuerById(this.user.id)
		.pipe(
			takeUntil(this.destroy$),
			finalize(() => this.isLoadingUserDetail = false)
		)
		.subscribe({
			next: (res) => {
				if (res?.isSuccess) {
					this.selectedItem = res.data;
				} else {
					this.onClose();
				}
			},
			error: (err) => {
				this.onClose();
			}
		});
	}
	
	// Load change history when history tab is opened
	loadChangeHistory(): void {
		if (!this.selectedItem?.id) {
			this.toast.error('Không tìm thấy TCPH!');
			return;
		}
		
		// Only load if not already loaded
		if (this.changeHistory.length > 0) {
			return;
		}
		
		this.isLoadingHistory = true;
		(this.userService as any).getIssuerChangeHistoryById(this.selectedItem.id)
		.pipe(
			takeUntil(this.destroy$),
			finalize(() => this.isLoadingHistory = false)
		)
		.subscribe({
			next: (res: any) => {
				if (res?.isSuccess) {
					this.changeHistory = res.data || [];
				} else {
					this.changeHistory = [];
				}
			},
			error: () => {
				this.changeHistory = [];
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
