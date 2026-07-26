import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, forkJoin, of, timer } from 'rxjs';
import { catchError, switchMap, takeUntil } from 'rxjs/operators';
import { ExchangeApiService } from './exchange-api.service';
import { MarketView } from './exchange.models';

interface MarketSessionRow {
  market: MarketView;
  state: string;
  starting: boolean;
}

@Component({
  selector: 'app-session-management',
  templateUrl: './session-management.component.html',
  styleUrls: ['./session-management.component.scss']
})
export class SessionManagementComponent implements OnInit, OnDestroy {
  rows: MarketSessionRow[] = [];
  errorMessage = '';

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly exchangeApi: ExchangeApiService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.exchangeApi.getMarkets().pipe(
      catchError(() => {
        this.errorMessage = 'Không tải được danh sách thị trường.';
        return of(null);
      }),
      takeUntil(this.destroy$)
    ).subscribe(response => {
      const markets = response?.isSuccess ? (response.data ?? []) : [];
      this.rows = markets.map(market => ({ market, state: 'Chưa khởi động', starting: false }));
      this.pollSessions();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack(): void {
    this.router.navigate(['/exchange']);
  }

  startSession(row: MarketSessionRow): void {
    if (row.starting || !this.canStart(row.state)) return;
    row.starting = true;
    this.errorMessage = '';
    this.exchangeApi.startSession(row.market.marketCode).pipe(takeUntil(this.destroy$)).subscribe({
      next: response => {
        row.starting = false;
        if (response?.isSuccess && response.data) {
          row.state = response.data.state;
        } else {
          this.errorMessage = response?.message || `Không thể khởi động phiên cho thị trường ${row.market.marketCode}.`;
        }
      },
      error: () => {
        row.starting = false;
        this.errorMessage = `Không thể khởi động phiên cho thị trường ${row.market.marketCode}.`;
      }
    });
  }

  canStart(state: string): boolean {
    const normalized = state.toLowerCase();
    return normalized !== 'preopen' && normalized !== 'ato' && normalized !== 'continuous' &&
      normalized !== 'intermission' && normalized !== 'atc' && normalized !== 'plo';
  }

  isOpen(state: string): boolean {
    const normalized = state.toLowerCase();
    return normalized === 'ato' || normalized === 'continuous' || normalized === 'intermission' || normalized === 'atc';
  }

  private pollSessions(): void {
    if (!this.rows.length) return;
    timer(0, 2000).pipe(
      takeUntil(this.destroy$),
      switchMap(() => forkJoin(
        this.rows.map(row => this.exchangeApi.getSession(row.market.marketCode).pipe(catchError(() => of(null))))
      ))
    ).subscribe(responses => {
      responses.forEach((response, index) => {
        if (response?.isSuccess && response.data?.state) {
          this.rows[index].state = response.data.state;
        }
      });
    });
  }
}
