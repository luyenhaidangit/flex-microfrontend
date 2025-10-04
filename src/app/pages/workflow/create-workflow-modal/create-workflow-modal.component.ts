import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from 'angular-toastify';
import { WorkflowService } from '../workflow.service';

@Component({
  selector: 'app-create-workflow-modal',
  templateUrl: './create-workflow-modal.component.html',
  styleUrls: ['./create-workflow-modal.component.scss']
})
export class CreateWorkflowModalComponent implements OnInit {
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  form!: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private workflowService: WorkflowService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.maxLength(200)]],
      description: [''],
      policy: ['']
    });
  }

  onClose(): void {
    this.close.emit();
    this.form?.reset();
    this.isSubmitting = false;
  }

  submit(): void {
    if (this.isSubmitting || !this.form.valid) return;
    this.isSubmitting = true;
    const dto = { ...this.form.value };
    if (dto.policy && typeof dto.policy === 'string') {
      try { dto.policy = JSON.parse(dto.policy); } catch {}
    }
    this.workflowService.createDraft(dto).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.toast.success('Tạo workflow thành công');
          this.created.emit();
        } else {
          this.toast.error(res?.message || 'Không thể tạo workflow');
        }
        this.isSubmitting = false;
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }
}


