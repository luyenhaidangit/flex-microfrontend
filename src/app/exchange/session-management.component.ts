import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { ExchangeApiService } from './exchange-api.service';
import { ExchangeRealtimeService } from './exchange-realtime.service';
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
    private readonly realtime: ExchangeRealtimeService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    // 1. Lấy danh sách market và trạng thái ban đầu
    this.exchangeApi.getMarkets().pipe(
      catchError(() => {
        this.errorMessage = 'Không tải được danh sách thị trường.';
        return of(null);
      }),
      takeUntil(this.destroy$)
    ).subscribe(response => {
      const markets = response?.isSuccess ? (response.data ?? []) : [];
      this.rows = markets.map(market => ({ market, state: 'Chưa khởi động', starting: false }));
      this.loadInitialSessionStates();
    });

    // 2. Lắng nghe SESSION_STATE_CHANGED realtime — không poll
    this.realtime.sessionState$.pipe(takeUntil(this.destroy$)).subscribe(event => {
      const row = this.rows.find(r =>
        r.market.marketCode.toUpperCase() === event.market.toUpperCase()
      );
      if (row) {
        row.state = event.state;
      }
    });

    this.realtime.connect();
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

  // Lấy trạng thái hiện tại một lần duy nhất lúc load — không lặp
  private loadInitialSessionStates(): void {
    if (!this.rows.length) return;
    this.rows.forEach(row => {
      this.exchangeApi.getSession(row.market.marketCode).pipe(
        catchError(() => of(null)),
        takeUntil(this.destroy$)
      ).subscribe(response => {
        if (response?.isSuccess && response.data?.state) {
          row.state = response.data.state;
        }
      });
    });
  }
}
