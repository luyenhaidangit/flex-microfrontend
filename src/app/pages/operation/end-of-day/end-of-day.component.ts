import { Component } from '@angular/core';

@Component({
  selector: 'app-end-of-day',
  template: `
  <div class="container-fluid">
    <app-page-title
      title="X? lý cu?i ngày"
      [breadcrumbItems]="breadCrumbItems">
    </app-page-title>

    <div class="bg-white rounded shadow-sm p-3">
      <p class="text-muted mb-3">Trang thao tác x? lý cu?i ngày. B?n có th? b? sung các bu?c EOD và tr?ng thái t?i dây.</p>

      <button class="btn btn-primary" [disabled]="processing" (click)="runEod()">
        <span *ngIf="!processing"><i class="bx bx-time-five"></i> Ch?y x? lý cu?i ngày</span>
        <span *ngIf="processing" class="spinner-border spinner-border-sm me-1"></span>
        <span *ngIf="processing">Ðang ch?y...</span>
      </button>
    </div>
  </div>
  `,
  styleUrls: ['./end-of-day.component.scss']
})
export class EndOfDayComponent {
  breadCrumbItems = [
    { label: 'V?n hành' },
    { label: 'X? lý cu?i ngày', active: true }
  ];

  processing = false;

  runEod() {
    this.processing = true;
    setTimeout(() => this.processing = false, 1500);
  }
}