import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ToastService } from 'angular-toastify';
import { finalize } from 'rxjs/operators';
import { BadgeTypeConfig } from 'src/app/shared/ui/badge/badge.component';
import { Agent } from '../../models/agent.model';
import { AgentService } from '../../services/agent.service';

@Component({
  selector: 'app-agent-delete-confirm-modal',
  templateUrl: './agent-delete-confirm-modal.component.html',
  styleUrls: ['./agent-delete-confirm-modal.component.scss']
})
export class AgentDeleteConfirmModalComponent {
  @Input() isVisible = false;
  @Input() agent: Agent | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  readonly agentStatusConfigs: BadgeTypeConfig = {
    active:   { label: 'Hoạt động',     class: 'badge-soft-success',   value: 'active' },
    inactive: { label: 'Không hoạt động', class: 'badge-soft-danger',    value: 'inactive' },
  };

  isSubmitting = false;

  constructor(
    private agentService: AgentService,
    private toastService: ToastService
  ) {}

  onCancel(): void {
    this.close.emit();
  }

  onConfirm(): void {
    if (!this.agent) {
      return;
    }

    this.isSubmitting = true;
    this.agentService
      .deleteAgent(this.agent.id)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this.toastService.success('Xóa Agent thành công.');
          this.deleted.emit();
        },
        error: () => {
        }
      });
  }
}
