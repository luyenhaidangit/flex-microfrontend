import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from 'angular-toastify';
import { IssuerService as UserService } from '../issuer.service';
import { BranchItem, UserItem } from '../issuer.models';

export interface UpdateIssuerRequest {
  issuerCode: string;
  email: string;
  issuerName: string;
  branchId: number;
  isActive: boolean;
}

@Component({
  selector: 'app-edit-user-modal',
  templateUrl: './edit-user-modal.component.html',
  styleUrls: ['./edit-user-modal.component.scss']
})
export class EditUserModalComponent implements OnInit, OnChanges {
  @Input() isVisible = false;
  @Input() user: UserItem | null = null;
  @Input() branches: BranchItem[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  userForm!: FormGroup;
  isSubmitting = false;
  isLoadingInitial = false;
  private hasLoadedData = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    if (this.user && !this.hasLoadedData) this.loadInitialData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.isVisible && this.user && !this.hasLoadedData) this.loadInitialData();
    if (changes['isVisible'] && this.isVisible && this.user && !this.hasLoadedData) this.loadInitialData();
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      issuerCode: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9._-]+'), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      issuerName: ['', [Validators.required, Validators.maxLength(100)]],
      branchId: [null, [Validators.required]],
      isActive: [true, [Validators.required]]
    });
  }

  private populateForm(): void {
    if (!this.user) return;
    this.userForm.patchValue({
      issuerCode: (this.user as any).issuerCode || '',
      email: this.user.email || '',
      issuerName: (this.user as any).issuerName || '',
      branchId: this.user.branchId || null,
      isActive: this.user.isActive ?? true
    });
  }

  private loadInitialData(): void {
    if (this.hasLoadedData) return;
    this.isLoadingInitial = true;
    this.hasLoadedData = true;
    const code = (this.user as any)?.issuerCode;
    if (code) {
      (this.userService as any).getIssuerByCode(code).subscribe({
        next: (res: any) => {
          if (res?.isSuccess) this.user = res.data;
          this.populateForm();
          this.isLoadingInitial = false;
        },
        error: () => { this.populateForm(); this.isLoadingInitial = false; }
      });
    } else {
      this.populateForm();
      this.isLoadingInitial = false;
    }
  }

  onSubmit(): void {
    this.userForm.markAllAsTouched();
    if (this.userForm.invalid || this.isSubmitting || !this.user) return;
    this.isSubmitting = true;
    const v = this.userForm.value;
    const dto: UpdateIssuerRequest = {
      issuerCode: (v.issuerCode || '').trim(),
      email: (v.email || '').trim(),
      issuerName: (v.issuerName || '').trim(),
      branchId: v.branchId,
      isActive: v.isActive
    };
    (this.userService as any).updateIssuerRequest(dto).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        if (res?.isSuccess) {
          this.toast.success('Cập nhật TCPH thành công');
          this.updated.emit();
          this.closeModal();
        } else {
          this.toast.error(res?.message || 'Không thể cập nhật');
        }
      },
      error: () => { this.isSubmitting = false; this.toast.error('Lỗi khi gửi yêu cầu'); }
    });
  }

  onCancel(): void { this.closeModal(); }
  closeModal(): void { this.close.emit(); this.resetStates(); }

  private resetStates(): void {
    this.hasLoadedData = false;
    this.isLoadingInitial = false;
    this.isSubmitting = false;
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field?.touched && field?.invalid) {
      if (field.errors?.['required']) return `${this.getFieldLabel(fieldName)} không được để trống`;
      if (field.errors?.['email']) return 'Email không đúng định dạng';
      if (field.errors?.['pattern']) return `${this.getFieldLabel(fieldName)} chỉ được chứa chữ, số, dấu chấm, gạch dưới và gạch ngang`;
      if (field.errors?.['maxlength']) {
        const maxLength = field.errors['maxlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} không được vượt quá ${maxLength} ký tự`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      issuerCode: 'Mã TCPH',
      email: 'Email',
      issuerName: 'Tên TCPH',
      branchId: 'Chi nhánh',
      isActive: 'Trạng thái'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field?.touched && field?.invalid);
  }

  hasChanges(): boolean {
    if (!this.user) return false;
    const v = this.userForm.value;
    return (
      v.issuerCode !== ((this.user as any).issuerCode || '') ||
      v.email !== (this.user.email || '') ||
      v.issuerName !== ((this.user as any).issuerName || '') ||
      v.branchId !== (this.user.branchId || null) ||
      v.isActive !== (this.user.isActive ?? true)
    );
  }
}

