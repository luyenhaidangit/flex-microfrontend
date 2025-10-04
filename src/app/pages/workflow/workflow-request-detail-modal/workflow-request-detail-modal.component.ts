import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-workflow-request-detail-modal',
  templateUrl: './workflow-request-detail-modal.component.html',
  styleUrls: ['./workflow-request-detail-modal.component.scss']
})
export class WorkflowRequestDetailModalComponent implements OnChanges {
  @Input() isVisible = false;
  @Input() selectedRequest: any;
  @Output() close = new EventEmitter<void>();

  detail: any = null;

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['selectedRequest'] || changes['isVisible']) && this.isVisible && this.selectedRequest) {
      this.detail = {
        requestId: this.selectedRequest?.requestId || this.selectedRequest?.id,
        code: this.selectedRequest?.code,
        name: this.selectedRequest?.name,
        action: this.selectedRequest?.action,
        requestedBy: this.selectedRequest?.requestedBy,
        requestedDate: this.selectedRequest?.requestedDate
      };
    }
  }

  onClose(): void {
    this.close.emit();
    this.detail = null;
  }
}


