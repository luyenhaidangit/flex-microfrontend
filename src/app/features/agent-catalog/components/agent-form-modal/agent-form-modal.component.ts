import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from 'angular-toastify';
import { finalize } from 'rxjs/operators';
import { Agent, PublishLocation } from '../../models/agent.model';
import { AgentService } from '../../services/agent.service';
import { PUBLISH_LOCATIONS_CATALOG } from '../../publish-locations.catalog';

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
  activeTab: 'general' | 'publish' = 'general';
  catalogLocations = PUBLISH_LOCATIONS_CATALOG;

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
      status: ['active', [Validators.required]],
      description: ['', [Validators.maxLength(500)]],
      instagramEnabled: [false]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible'] && this.isVisible) {
      this.activeTab = 'general';
      const instagramLoc = this.agent?.publishLocations?.find(
        l => l.locationCode.toLowerCase() === 'instagram'
      );
      const isInstagramEnabled = instagramLoc ? instagramLoc.isEnabled : false;

      this.form.reset({
        name: this.agent?.name ?? '',
        status: this.agent?.status ?? 'active',
        description: this.agent?.description ?? '',
        instagramEnabled: isInstagramEnabled
      });
    }
  }

  selectTab(tab: 'general' | 'publish'): void {
    if (tab === 'publish' && !this.isEditMode) {
      return;
    }
    this.activeTab = tab;
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.touched && field?.invalid) {
      if (field.errors?.['required']) return `${this.getFieldLabel(fieldName)} không được để trống`;
      if (field.errors?.['maxlength']) {
        const maxLength = field.errors['maxlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} không được vượt quá ${maxLength} ký tự`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      name: 'Tên Agent',
      status: 'Trạng thái',
      description: 'Mô tả'
    };
    return labels[fieldName] || fieldName;
  }

  onCancel(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const publishLocations: PublishLocation[] = [
      {
        locationCode: 'instagram',
        isEnabled: !!this.form.value.instagramEnabled
      }
    ];

    const request = {
      name: (this.form.value.name as string).trim(),
      status: this.form.value.status || 'active',
      description: this.form.value.description || null,
      publishLocations: publishLocations
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
