import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  @Input() isVisible = false;
  @Input() user: UserItem | null = null;
  @Input() branches: BranchItem[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  userForm!: FormGroup;
  isLoading = false;
  isSubmitting = false;
  isLoadingInitial = false;
  private hasLoadedData = false; // Flag to prevent duplicate API calls

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private systemService: SystemService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    // Check if user is already available and load data
    if (this.user && !this.hasLoadedData) {
      this.loadInitialData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Check if user input changed and modal is visible
    if (changes['user'] && this.isVisible && this.user && !this.hasLoadedData) {
      this.loadInitialData();
    }
    
    // Check if modal visibility changed
    if (changes['isVisible'] && this.isVisible && this.user && !this.hasLoadedData) {
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
      
      // Debug logging
      console.log('Form populated with:', {
        userName: this.user.userName,
        email: this.user.email,
        fullName: this.user.fullName,
        branchId: this.user.branchId,
        branchName: this.user.branchName,
        branch: this.user.branch,
        isActive: this.user.isActive,
        availableBranches: this.branches,
        formValue: this.userForm.value
      });
    }
  }

  private loadInitialData(): void {
    if (this.hasLoadedData) {
      return; // Prevent duplicate calls
    }
    
    this.isLoadingInitial = true;
    this.hasLoadedData = true; // Set flag to prevent duplicate calls
    
    // Load user details - this will provide all needed data including branch info
    if (this.user?.userName) {
      this.loadUserDetails();
    } else {
      // If no userName, just populate form with available data
      this.populateForm();
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
            
            // Map branch data from API response
            if (this.user.branch) {
              // Set branchId from branch object
              this.user.branchId = this.user.branch.id;
              this.user.branchName = this.user.branch.name;
            }
            
            // Don't override branches list - keep the one passed from parent component
            // The branches list should contain all available branches for selection
            
            // Now populate form with all data ready
            this.populateForm();
            this.isLoadingInitial = false;
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
    this.close.emit();
    this.resetStates();
  }

  // Reset all states
  private resetStates(): void {
    this.hasLoadedData = false;
    this.isLoadingInitial = false;
    this.isSubmitting = false;
    this.isLoading = false;
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

