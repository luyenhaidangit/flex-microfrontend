import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from 'angular-toastify';
import { IssuerService } from '../issuer.service';

export interface UpdateIssuerRequest {
  id: number;
  issuerCode: string;
  shortName: string;
  fullName: string;
  comment?: string;
}

@Component({
  selector: 'app-edit-issuer-modal',
  templateUrl: './edit-issuer-modal.component.html',
  styleUrls: ['./edit-issuer-modal.component.scss']
})
export class EditIssuerModalComponent implements OnInit, OnChanges {
  @Input() isVisible = false;
  @Input() issuer: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  issuerForm!: FormGroup;
  isSubmitting = false;
  isLoadingInitial = false;
  private hasLoadedData = false;

  constructor(
    private fb: FormBuilder,
    private issuerService: IssuerService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    if (this.issuer && !this.hasLoadedData) this.loadInitialData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['issuer'] && this.isVisible && this.issuer && !this.hasLoadedData) this.loadInitialData();
    if (changes['isVisible'] && this.isVisible && this.issuer && !this.hasLoadedData) this.loadInitialData();
  }

  private initializeForm(): void {
    this.issuerForm = this.fb.group({
      issuerCode: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9._-]+'), Validators.maxLength(50)]],
      shortName: ['', [Validators.required, Validators.maxLength(50)]],
      fullName: ['', [Validators.required, Validators.maxLength(200)]],
      comment: ['', [Validators.maxLength(500)]]
    });
  }

  private populateForm(): void {
    if (!this.issuer) return;
    this.issuerForm.patchValue({
      issuerCode: (this.issuer as any).issuerCode || '',
      shortName: (this.issuer as any).shortName || '',
      fullName: (this.issuer as any).fullName || '',
      comment: (this.issuer as any).comment || ''
    });
  }

  private loadInitialData(): void {
    if (this.hasLoadedData) return;
    this.isLoadingInitial = true;
    this.hasLoadedData = true;
    const id = (this.issuer as any)?.id;
    if (id) {
      this.issuerService.getIssuerById(id).subscribe({
        next: (res: any) => {
          if (res?.isSuccess) this.issuer = res.data;
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
    this.issuerForm.markAllAsTouched();
    if (this.issuerForm.invalid || this.isSubmitting || !this.issuer) return;
    this.isSubmitting = true;
    const v = this.issuerForm.value;
    const dto: UpdateIssuerRequest = {
      id: (this.issuer as any)?.id,
      issuerCode: (v.issuerCode || '').trim(),
      shortName: (v.shortName || '').trim(),
      fullName: (v.fullName || '').trim(),
      comment: (v.comment || '').trim()
    };
    this.issuerService.updateIssuerRequest(dto).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        if (res?.isSuccess) {
          this.toast.success('Cập nhật tổ chức phát hành thành công');
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
    const field = this.issuerForm.get(fieldName);
    if (field?.touched && field?.invalid) {
      if (field.errors?.['required']) return `${this.getFieldLabel(fieldName)} không được để trống`;
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
      issuerCode: 'Mã tổ chức phát hành', 
      shortName: 'Tên viết tắt', 
      fullName: 'Tên đầy đủ', 
      comment: 'Ghi chú' 
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.issuerForm.get(fieldName);
    return !!(field?.touched && field?.invalid);
  }

  hasChanges(): boolean {
    if (!this.issuer) return false;
    const v = this.issuerForm.value;
    return (v.issuerCode !== ((this.issuer as any).issuerCode || '') || 
            v.shortName !== ((this.issuer as any).shortName || '') || 
            v.fullName !== ((this.issuer as any).fullName || '') || 
            v.comment !== ((this.issuer as any).comment || ''));
  }
}
