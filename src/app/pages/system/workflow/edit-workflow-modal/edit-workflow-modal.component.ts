import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from 'angular-toastify';
import { WorkflowService } from '../workflow.service';

@Component({
  selector: 'app-edit-workflow-modal',
  templateUrl: './edit-workflow-modal.component.html',
  styleUrls: ['./edit-workflow-modal.component.scss']
})
export class EditWorkflowModalComponent implements OnInit, OnChanges {
  @Input() isVisible = false;
  @Input() workflow: any;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  form!: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private workflowService: WorkflowService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      description: [''],
      policy: ['']
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['workflow'] && this.workflow) {
      this.form?.patchValue({
        name: this.workflow?.name || '',
        description: this.workflow?.description || '',
        policy: this.workflow?.policy ? JSON.stringify(this.workflow.policy, null, 2) : ''
      });
    }
  }

  onClose(): void {
    this.close.emit();
    this.form?.reset();
    this.isSubmitting = false;
  }

  submit(): void {
    if (this.isSubmitting || !this.form.valid) return;
    const code = this.workflow?.code;
    if (!code) { this.toast.error('Không tìm thấy mã workflow!'); return; }
    this.isSubmitting = true;
    const dto = { ...this.form.value };
    if (dto.policy && typeof dto.policy === 'string') {
      try { dto.policy = JSON.parse(dto.policy); } catch {}
    }
    this.workflowService.updateDraft(code, dto).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.toast.success('Cập nhật workflow thành công');
          this.updated.emit();
        } else {
          this.toast.error(res?.message || 'Không thể cập nhật workflow');
        }
        this.isSubmitting = false;
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }
}


