import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastService } from 'angular-toastify';
import { SystemService } from 'src/app/core/services/system.service';
import { UserService } from '../user.service';
import { BranchItem } from '../user.models';

export interface CreateUserRequest {
  userName: string;
  email: string;
  fullName: string;
  branchId: number;
  isActive: boolean;
  comment?: string;
}

@Component({
  selector: 'app-create-user-modal',
  templateUrl: './create-user-modal.component.html',
  styleUrls: ['./create-user-modal.component.scss']
})
export class CreateUserModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  userForm!: FormGroup;
  branches: BranchItem[] = [];
  isLoading = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private systemService: SystemService,
    private toastService: ToastService,
    public modalRef: BsModalRef
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadBranches();
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      userName: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9._-]+'), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      fullName: ['', [Validators.required, Validators.maxLength(100)]],
      branchId: [null, [Validators.required]],
      isActive: [true, [Validators.required]],
      comment: ['', [Validators.maxLength(500)]]
    });
  }

  private loadBranches(): void {
    this.isLoading = true;
    this.systemService.getBranchesForFilter()
      .pipe(
        // finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res?.isSuccess) {
            this.branches = res.data || [];
          } else {
            this.branches = [];
            this.toastService.error('Không thể tải danh sách chi nhánh!');
          }
        },
        error: () => {
          this.isLoading = false;
          this.branches = [];
          this.toastService.error('Lỗi khi tải danh sách chi nhánh!');
        }
      });
  }

  onSubmit(): void {
    this.userForm.markAllAsTouched();
    if (this.userForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    const formData = this.userForm.value;
    
    const createRequest: CreateUserRequest = {
      userName: formData.userName.trim(),
      email: formData.email.trim(),
      fullName: formData.fullName.trim(),
      branchId: formData.branchId,
      isActive: formData.isActive,
      comment: formData.comment?.trim() || ''
    };

    this.userService.createUser(createRequest)
      .subscribe({
        next: (res) => {
          this.isSubmitting = false;
          if (res?.isSuccess) {
            this.toastService.success('Gửi yêu cầu tạo user thành công!');
            this.userForm.reset();
            this.userForm.patchValue({ isActive: true });
            this.created.emit();
            this.closeModal();
          } else {
            this.toastService.error(res?.message || 'Không thể tạo user!');
          }
        },
        error: (err) => {
          this.isSubmitting = false;
          this.toastService.error('Lỗi khi tạo user!');
        }
      });
  }

  onCancel(): void {
    this.userForm.reset();
    this.userForm.patchValue({ isActive: true });
    this.closeModal();
  }

  closeModal(): void {
    this.modalRef?.hide();
    this.close.emit();
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
      userName: 'Tên đăng nhập',
      email: 'Email',
      fullName: 'Họ và tên',
      branchId: 'Chi nhánh',
      isActive: 'Trạng thái',
      comment: 'Ghi chú'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field?.touched && field?.invalid);
  }
}
