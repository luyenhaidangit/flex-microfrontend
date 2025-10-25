import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from 'angular-toastify';
import { UserService } from '../issuer.service';

interface CreateIssuerRequestDto { issuerCode: string; shortName: string; fullName: string; comment?: string; }

@Component({
  selector: 'app-create-issuer-modal',
  templateUrl: './create-issuer-modal.component.html',
  styleUrls: ['./create-issuer-modal.component.scss']
})
export class CreateIssuerModalComponent implements OnInit {
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  userForm!: FormGroup;
  isSubmitting = false;
  isLoadingCode = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.prefillIssuerCode();
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      issuerCode: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9._-]+'), Validators.maxLength(50)]],
      shortName: ['', [Validators.required, Validators.maxLength(100)]],
      fullName: ['', [Validators.required, Validators.maxLength(200)]],
      comment: ['',[Validators.maxLength(500)]]
    });
  }

  private prefillIssuerCode(): void {
    this.isLoadingCode = true;
    (this.userService as any).getNextIssuerCode(false).subscribe({
      next: (res: any) => {
        this.isLoadingCode = false;
        const code = res?.data?.code || res?.code || '';
        if (code) this.userForm.patchValue({ issuerCode: code });
      },
      error: (err) => {
        this.isLoadingCode = false;
        console.error('Error loading issuer code:', err);
      }
    });
  }

  onSubmit(): void {
    this.userForm.markAllAsTouched();
    if (this.userForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    const formData = this.userForm.value;
    
    const createRequest: CreateIssuerRequestDto = {
      issuerCode: (formData.issuerCode || '').trim(),
      shortName: (formData.shortName || '').trim(),
      fullName: (formData.fullName || '').trim(),
      comment: (formData.comment || '').trim() || undefined
    };

    (this.userService as any).createIssuer(createRequest)
      .subscribe({
        next: (res) => {
          this.isSubmitting = false;
          if (res?.isSuccess) {
            this.toastService.success('Gửi yêu cầu tạo tổ chức phát hành thành công!');
            this.userForm.reset();
            this.created.emit();
            this.closeModal();
          } else {
            this.toastService.error(res?.message || 'Không thể tạo tổ chức phát hành!');
          }
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Error creating issuer:', err);
          this.toastService.error('Có lỗi xảy ra khi tạo tổ chức phát hành. Vui lòng thử lại!');
        }
      });
  }

  onCancel(): void {
    this.userForm.reset();
    this.closeModal();
  }

  closeModal(): void {
    this.close.emit();
    this.resetStates();
  }

  // Reset all states
  private resetStates(): void {
    this.userForm.reset();
    this.isSubmitting = false;
    this.isLoadingCode = false;
  }

  // Helper methods for form validation
  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field?.touched && field?.invalid) {
      if (field.errors?.['required']) {
        return `${this.getFieldLabel(fieldName)} không được để trống`;
      }
      if (field.errors?.['email']) {
        return 'Email không đúng định dạng';
      }
      if (field.errors?.['pattern']) {
        return `${this.getFieldLabel(fieldName)} chỉ được chứa chữ, số, dấu chấm, gạch dưới và gạch ngang`;
      }
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
      shortName: 'Tên viết tắt',
      fullName: 'Tên đầy đủ',
      comment: 'Ghi chú'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field?.touched && field?.invalid);
  }
}
