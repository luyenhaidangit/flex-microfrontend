import { Component, EventEmitter, Input, OnInit, Output, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from 'angular-toastify';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { IssuerService as UserService } from '../issuer.service';
import { UserItem } from '../issuer.models';


@Component({
  selector: 'app-delete-user-modal',
  templateUrl: './delete-user-modal.component.html',
  styleUrls: ['./delete-user-modal.component.scss']
})
export class DeleteUserModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() user: UserItem | null = null;
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  deleteForm!: FormGroup;
  isLoading = false;
  isSubmitting = false;
  isLoadingUserDetail = false;
  selectedItem: UserItem | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
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

  private initializeForm(): void {
    this.deleteForm = this.fb.group({
      // Không cần trường comment nữa
    });
  }

  onClose(): void {
    this.close.emit();
    this.resetStates();
  }

  // Load detailed user information
  private loadUserDetail(): void {
    if (!this.user?.id) {
      this.toastService.error('Không tìm thấy thông tin TCPH!');
      this.onClose();
      return;
    }

    this.isLoadingUserDetail = true;
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
            this.toastService.error('Không thể lấy thông tin chi tiết TCPH!');
            this.onClose();
          }
        },
        error: (err) => {
          this.toastService.error('Không thể lấy thông tin chi tiết TCPH!');
          this.onClose();
        }
      });
  }

  onSubmit(): void {
    if (!(this.user as any)?.issuerId && !(this.user as any)?.issuerCode) {
      return;
    }

    this.isSubmitting = true;

    const issuerId = (this.user as any)?.issuerId || (this.user as any)?.issuerCode;
    (this.userService as any).createDeleteIssuerRequest(issuerId)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.toastService.success('Yêu cầu xóa người dùng đã được gửi thành công!');
          this.deleted.emit();
          this.onClose();
        },
        error: (error) => {
          console.error('Error creating delete user request:', error);
          this.toastService.error('Có lỗi xảy ra khi gửi yêu cầu xóa!');
        }
      });
  }

  // Reset all states
  private resetStates(): void {
    this.selectedItem = null;
    this.isLoadingUserDetail = false;
  }

  get isFormValid(): boolean {
    return !this.isSubmitting;
  }
}
