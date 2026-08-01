import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from 'angular-toastify';
import { finalize } from 'rxjs/operators';
import { Agent } from '../../models/agent.model';
import { AgentService } from '../../services/agent.service';

@Component({
  selector: 'app-agent-form-modal',
  templateUrl: './agent-form-modal.component.html',
  styleUrls: ['./agent-form-modal.component.scss']
})
export class AgentFormModalComponent implements OnChanges {
  @Input() isVisible = false;
  @Input() agent: Agent | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  form: FormGroup;
  isSubmitting = false;

  get isEditMode(): boolean {
    return !!this.agent;
  }

  constructor(
    private fb: FormBuilder,
    private agentService: AgentService,
    private toastService: ToastService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible'] && this.isVisible) {
      this.form.reset({
        name: this.agent?.name ?? '',
        description: this.agent?.description ?? ''
      });
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  onCancel(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request = {
      name: (this.form.value.name as string).trim(),
      description: this.form.value.description || null
    };

    this.isSubmitting = true;
    const request$ = this.isEditMode
      ? this.agentService.updateAgent(this.agent!.id, request)
      : this.agentService.createAgent(request);

    request$.pipe(finalize(() => (this.isSubmitting = false))).subscribe({
      next: () => {
        this.toastService.success(this.isEditMode ? 'Cập nhật Agent thành công.' : 'Tạo Agent thành công.');
        this.saved.emit();
      },
      error: (err: HttpErrorResponse) => {
        this.toastService.error(err.error?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
      }
    });
  }
}
