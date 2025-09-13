import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastService } from 'angular-toastify';
import { SystemService } from 'src/app/core/services/system.service';
import { UserService } from '../user.service';
import { BranchItem, UserItem } from '../user.models';

export interface UpdateUserRequest {
  userName: string;
  email: string;
  fullName: string;
  branchId: number;
  isActive: boolean;
}

@Component({
  selector: 'app-edit-user-modal',
  templateUrl: './edit-user-modal.component.html',
  styleUrls: ['./edit-user-modal.component.scss']
})
export class EditUserModalComponent implements OnInit, OnChanges {
  @Input() user: UserItem | null = null;
  @Input() branches: BranchItem[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  userForm!: FormGroup;
  isLoading = false;
  isSubmitting = false;
  isLoadingInitial = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private systemService: SystemService,
    private toastService: ToastService,
    public modalRef: BsModalRef
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadInitialData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user) {
      this.loadInitialData();
    }
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      userName: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9._-]+'), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      fullName: ['', [Validators.required, Validators.maxLength(100)]],
      branchId: [null, [Validators.required]],
      isActive: [true, [Validators.required]]
    });
  }

  private populateForm(): void {
    if (this.user) {
      this.userForm.patchValue({
        userName: this.user.userName,
        email: this.user.email || '',
        fullName: this.user.fullName || '',
        branchId: this.user.branchId || null,
        isActive: this.user.isActive ?? true
      });
    }
  }

  private loadInitialData(): void {
    this.isLoadingInitial = true;
    
    // Load user details - this will provide all needed data including branch info
    if (this.user?.userName) {
      this.loadUserDetails();
    } else {
      this.isLoadingInitial = false;
    }
  }

  private loadUserDetails(): void {
    if (!this.user?.userName) {
      this.isLoadingInitial = false;
      return;
    }

    this.isLoading = true;
    this.userService.getUserByUsername(this.user.userName)
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res?.isSuccess) {
            // Update user with fresh data from API
            this.user = res.data;
            
            // Use branches from input if available, otherwise create from user data
            if (this.branches && this.branches.length > 0) {
              this.populateForm();
              this.isLoadingInitial = false;
            } else {
              // Create branches list from user's branch info if no branches provided
              if (this.user.branch) {
                this.branches = [this.user.branch];
              } else if (this.user.branchId && this.user.branchName) {
                // Fallback: create branch object from branchId and branchName
                this.branches = [{
                  id: this.user.branchId,
                  name: this.user.branchName
                }];
              } else {
                this.branches = [];
              }
              this.populateForm();
              this.isLoadingInitial = false;
            }
          } else {
            this.toastService.error(res?.message || 'Không thể tải thông tin user!');
            this.isLoadingInitial = false;
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.toastService.error('Lỗi khi tải thông tin user!');
          this.isLoadingInitial = false;
        }
      });
  }

  onSubmit(): void {
    this.userForm.markAllAsTouched();
    if (this.userForm.invalid || this.isSubmitting || !this.user) return;

    this.isSubmitting = true;
    const formData = this.userForm.value;
    
    const updateRequest: UpdateUserRequest = {
      userName: formData.userName.trim(),
      email: formData.email.trim(),
      fullName: formData.fullName.trim(),
      branchId: formData.branchId,
      isActive: formData.isActive
    };

    this.userService.updateUserRequest(updateRequest)
      .subscribe({
        next: (res) => {
          this.isSubmitting = false;
          if (res?.isSuccess) {
            this.toastService.success('Gửi yêu cầu cập nhật user thành công!');
            this.updated.emit();
            this.closeModal();
          } else {
            this.toastService.error(res?.message || 'Không thể cập nhật user!');
          }
        },
        error: (err) => {
          this.isSubmitting = false;
          this.toastService.error('Lỗi khi gửi yêu cầu cập nhật user!');
        }
      });
  }

  onCancel(): void {
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
      isActive: 'Trạng thái'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field?.touched && field?.invalid);
  }

  // Check if form has changes
  hasChanges(): boolean {
    if (!this.user) return false;
    
    const formData = this.userForm.value;
    return (
      formData.userName !== this.user.userName ||
      formData.email !== (this.user.email || '') ||
      formData.fullName !== (this.user.fullName || '') ||
      formData.branchId !== (this.user.branchId || null) ||
      formData.isActive !== (this.user.isActive ?? true)
    );
  }
}

