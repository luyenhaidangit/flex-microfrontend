import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { ToastService } from 'angular-toastify';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { SecuritiesService } from '../securities.service';
import { SecuritiesItem } from '../securities.models';

@Component({
	selector: 'app-securities-detail-modal',
	templateUrl: './securities-detail-modal.component.html',
	styleUrls: ['./securities-detail-modal.component.scss']
})
export class SecuritiesDetailModalComponent implements OnInit, OnDestroy, OnChanges {
	@Input() isVisible = false;
	@Input() securities: SecuritiesItem | null = null;
	@Output() close = new EventEmitter<void>();
	
	selectedItem: SecuritiesItem | null = null;
	isLoadingSecuritiesDetail = false;
	
	private destroy$ = new Subject<void>();
	
	constructor(
		private securitiesService: SecuritiesService,
		private toast: ToastService
	) {}
	
	ngOnInit(): void {
	}
	
	ngOnChanges(changes: SimpleChanges): void {		
		// Check if securities input changed and modal is visible
		if (changes['securities'] && this.isVisible && this.securities) {
			this.loadSecuritiesDetail();
		}
		
		// Check if modal visibility changed
		if (changes['isVisible'] && this.isVisible && this.securities) {
			this.loadSecuritiesDetail();
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
	
	// Load detailed securities information
	private loadSecuritiesDetail(): void {
		if (!this.securities?.securitiesCode) {
			this.toast.error('Không tìm thấy thông tin chứng khoán!');
			this.onClose();
			return;
		}
		
		this.isLoadingSecuritiesDetail = true;
		this.selectedItem = null;
		
		this.securitiesService.getByCode(this.securities.securitiesCode)
		.pipe(
			takeUntil(this.destroy$),
			finalize(() => this.isLoadingSecuritiesDetail = false)
		)
		.subscribe({
			next: (res) => {
				if (res?.isSuccess) {
					this.selectedItem = res.data;
				} else {
					this.toast.error('Không tải được thông tin chi tiết chứng khoán!');
					this.onClose();
				}
			},
			error: (err) => {
				this.toast.error('Không tải được thông tin chi tiết chứng khoán!');
				this.onClose();
			}
		});
	}
	
	// Reset all states
	private resetStates(): void {
		this.selectedItem = null;
		this.isLoadingSecuritiesDetail = false;
	}
}
