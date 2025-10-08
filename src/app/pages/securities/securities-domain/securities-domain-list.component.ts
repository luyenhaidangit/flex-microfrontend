import { Component, OnInit } from '@angular/core';
import { SecuritiesDomainService } from './securities-domain.service';
import { SECURITIES_DOMAIN_CONFIG } from './securities-domain.config';
import { mapSettleMethodLabel, mapYesNo } from './securities-domain.helper';

@Component({
  selector: 'app-securities-domain-list',
  styleUrls: ['./securities-domain-list.component.scss'],
  template: `
    <div class="container-fluid">
      <app-page-title [title]="CONFIG.breadcrumb.title" [breadcrumbItems]="CONFIG.breadcrumb.items"></app-page-title>

      <div class="bg-white rounded shadow-sm p-3">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div></div>
          <button class="btn btn-outline-secondary" (click)="fetch()" [disabled]="loading">
            <i class="bx bx-refresh"></i> Tải lại
          </button>
        </div>

        <div *ngIf="error" class="alert alert-danger">{{ error }}</div>

        <div class="table-responsive table-header-primary">
          <table class="table align-middle table-nowrap dt-responsive nowrap w-100">
            <thead>
              <tr>
                <th *ngFor="let col of CONFIG.table.columns" [style.minWidth]="col.width">{{ col.label }}</th>
              </tr>
            </thead>

            <tbody *ngIf="loading">
              <tr *ngFor="let _ of [].constructor(8)">
                <td *ngFor="let w of CONFIG.table.skeleton.columns">
                  <app-skeleton [width]="w" height="18px"></app-skeleton>
                </td>
              </tr>
            </tbody>

            <tbody *ngIf="!loading && rows.length">
              <tr *ngFor="let r of rows; trackBy: trackByCode">
                <td><div class="fw-500">{{ r.domainName }}</div><div class="text-muted small">{{ r.domainCode }}</div></td>
                <td>{{ r.settlementType }}</td>
                <td>{{ r.settlementCycle }}</td>
                <td>{{ mapSettleMethodLabel(r.secSettlementType) }}</td>
                <td>{{ mapSettleMethodLabel(r.cashSettleType) }}</td>
                <td>{{ mapYesNo(r.isDefault) }}</td>
              </tr>
            </tbody>

            <tbody *ngIf="!loading && !rows.length">
              <tr>
                <td colspan="6" class="text-center text-muted">Không có dữ liệu</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class SecuritiesDomainListComponent implements OnInit {
  loading = false;
  rows: any[] = [];
  error?: string;
  CONFIG = SECURITIES_DOMAIN_CONFIG;
  mapSettleMethodLabel = mapSettleMethodLabel;
  mapYesNo = mapYesNo;

  constructor(private service: SecuritiesDomainService) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch() {
    this.loading = true;
    this.error = undefined;
    this.service.getDomains().subscribe({
      next: (res) => {
        this.rows = res?.data || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Không tải được dữ liệu';
        this.loading = false;
      }
    });
  }

  trackByCode(index: number, item: any) {
    return item.domainCode || index;
  }
}
