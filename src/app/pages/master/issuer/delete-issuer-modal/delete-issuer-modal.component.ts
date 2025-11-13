import { Component, EventEmitter, Input, OnInit, Output, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from 'angular-toastify';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { IssuerService } from '../issuer.service';
import { UserItem } from '../issuer.models';
import { SecuritiesService } from '../../securities/securities.service';
import { SecuritiesItem } from '../../securities/securities.models';

export interface IssuerItem {
  id: number;
  issuerCode: string;
  shortName: string;
  fullName: string;
  status: string;
}


@Component({
  selector: 'app-delete-issuer-modal',
  templateUrl: './delete-issuer-modal.component.html',
  styleUrls: ['./delete-issuer-modal.component.scss']
})
export class DeleteIssuerModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() issuer: UserItem | null = null;
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  deleteForm!: FormGroup;
  isLoading = false;
  isSubmitting = false;
  isLoadingIssuerDetail = false;
  selectedItem: IssuerItem | null = null;
  // Securities under issuer
  securitiesRows: SecuritiesItem[] = [];
  securitiesLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private issuerService: IssuerService,
    private securitiesService: SecuritiesService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Check if issuer input changed and modal is visible
    if (changes['issuer'] && this.isVisible && this.issuer) {
      this.loadIssuerDetail();
    }
    
    // Check if modal visibility changed
    if (changes['isVisible'] && this.isVisible && this.issuer) {
      this.loadIssuerDetail();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.deleteForm = this.fb.group({
      // Không cần trường comment nữa
    });
  }

  onClose(): void {
    this.close.emit();
    this.resetStates();
  }

  // Load detailed issuer information
  private loadIssuerDetail(): void {
    if (!this.issuer?.id) {
      this.toastService.error('Không tìm thấy thông tin tổ chức phát hành!');
      this.onClose();
      return;
    }

    this.isLoadingIssuerDetail = true;
    this.selectedItem = null;
    this.securitiesRows = [];
    this.securitiesLoading = false;

    this.issuerService.getIssuerById(this.issuer.id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoadingIssuerDetail = false)
      )
      .subscribe({
        next: (res) => {
          if (res?.isSuccess) {
            this.selectedItem = res.data;
            // Prefer embedded securities from detail response
            const embedded = (res.data && (res.data as any).securities) || [];
            if (Array.isArray(embedded) && embedded.length) {
              this.securitiesRows = embedded;
              this.securitiesLoading = false;
            } else {
              // Fallback: fetch by issuer id
              this.loadIssuerSecurities();
            }
          } else {
            this.onClose();
          }
        },
        error: (err) => {
          this.onClose();
        }
      });
  }

  // Load securities list belonging to issuer
  private loadIssuerSecurities(): void {
    if (!this.issuer?.id) {
      this.securitiesRows = [];
      return;
    }
    this.securitiesLoading = true;
    this.securitiesRows = [];
    this.securitiesService
      .getPaging({ pageIndex: 1, pageSize: 10, issuerId: this.issuer.id })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.securitiesLoading = false))
      )
      .subscribe({
        next: (res: any) => {
          if (res?.isSuccess) {
            this.securitiesRows = res.data?.items || res.data || [];
          } else {
            this.securitiesRows = [];
          }
        },
        error: () => (this.securitiesRows = [])
      });
  }

  onSubmit(): void {
    if (!this.issuer?.id) {
      return;
    }

    this.isSubmitting = true;

    const issuerId = this.issuer.id;
    const reason = 'Yêu cầu xóa tổ chức phát hành';
    
    this.issuerService.createDeleteIssuerRequest(issuerId, reason)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.toastService.success('Yêu cầu xóa tổ chức phát hành đã được gửi thành công!');
          this.deleted.emit();
          this.onClose();
        },
        error: (error) => {
          console.error('Error creating delete issuer request:', error);
        }
      });
  }

  // Reset all states
  private resetStates(): void {
    this.selectedItem = null;
    this.isLoadingIssuerDetail = false;
  }

  get isFormValid(): boolean {
    return !this.isSubmitting;
  }
}
