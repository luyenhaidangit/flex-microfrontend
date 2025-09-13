import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastService } from 'angular-toastify';
import { finalize } from 'rxjs/operators';
import { UserService } from '../user.service';
import { UserItem } from '../user.models';

export interface DeleteUserRequest {
  comment: string;
}

@Component({
  selector: 'app-delete-user-modal',
  templateUrl: './delete-user-modal.component.html',
  styleUrls: ['./delete-user-modal.component.scss']
})
export class DeleteUserModalComponent implements OnInit {
  @Input() user: UserItem | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  deleteForm!: FormGroup;
  isLoading = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toastService: ToastService,
    public modalRef: BsModalRef
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.deleteForm = this.fb.group({
      comment: ['', [Validators.maxLength(500)]]
    });
  }

  onClose(): void {
    this.close.emit();
    this.modalRef?.hide();
  }

  onSubmit(): void {
    this.deleteForm.markAllAsTouched();
    if (this.deleteForm.invalid || !this.user?.userName) {
      return;
    }

    this.isSubmitting = true;
    const formData = this.deleteForm.value;
    
    const deleteRequest: DeleteUserRequest = {
      comment: formData.comment || ''
    };

    this.userService.createDeleteUserRequest(this.user.userName, deleteRequest)
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

  get commentControl() {
    return this.deleteForm.get('comment');
  }

  get isFormValid(): boolean {
    return this.deleteForm.valid && !this.isSubmitting;
  }
}
