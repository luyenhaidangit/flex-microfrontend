import { Component } from '@angular/core';

@Component({
  selector: 'app-end-of-day',
  template: `
  <div class="container-fluid">
    <app-page-title
      title="X? l� cu?i ng�y"
      [breadcrumbItems]="breadCrumbItems">
    </app-page-title>

    <div class="bg-white rounded shadow-sm p-3">
      <p class="text-muted mb-3">Trang thao t�c x? l� cu?i ng�y. B?n c� th? b? sung c�c bu?c EOD v� tr?ng th�i t?i d�y.</p>

      <button class="btn btn-primary" [disabled]="processing" (click)="runEod()">
        <span *ngIf="!processing"><i class="bx bx-time-five"></i> Ch?y x? l� cu?i ng�y</span>
        <span *ngIf="processing" class="spinner-border spinner-border-sm me-1"></span>
        <span *ngIf="processing">�ang ch?y...</span>
      </button>
    </div>
  </div>
  `,
  styleUrls: ['./end-of-day.component.scss']
})
export class EndOfDayComponent {
  breadCrumbItems = [
    { label: 'V?n h�nh' },
    { label: 'X? l� cu?i ng�y', active: true }
  ];

  processing = false;

  runEod() {
    this.processing = true;
    setTimeout(() => this.processing = false, 1500);
  }
}