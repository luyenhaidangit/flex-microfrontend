import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-workflow-detail-modal',
  templateUrl: './workflow-detail-modal.component.html',
  styleUrls: ['./workflow-detail-modal.component.scss']
})
export class WorkflowDetailModalComponent {
  @Input() isVisible = false;
  @Input() workflow: any;
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}


