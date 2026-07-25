import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, Observable, Subject, forkJoin, of, timer } from 'rxjs';
import { catchError, switchMap, takeUntil, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ExchangeApiService } from './exchange-api.service';
import { ExchangeRealtimeService, MarketEventMessage, RealtimeConnectionState } from './exchange-realtime.service';
import {
  CancelOrderResponse,
  DemoBrokerOption,
  InstrumentItemView,
  MarketBoardViewModel,
  OrderStatusView,
  PlaceOrderResponse,
  PriceLevel,
  TradeTapeEntry
} from './exchange.models';

const STORAGE_KEY = 'flex_selected_symbol';

@Component({
  selector: 'app-market-board',
  templateUrl: './market-board.component.html',
  styleUrls: ['./market-board.component.scss']
})
export class MarketBoardComponent implements OnInit, OnDestroy {
  availableInstruments: InstrumentItemView[] = [];
  selectedSymbol = 'FXS';
  readonly brokers: DemoBrokerOption[] = environment.demoBrokers;
  readonly orderForm = this.formBuilder.group({
    brokerId: ['', Validators.required],
    side: ['Buy', Validators.required],
    price: [null as number | null, [Validators.required, Validators.min(1)]],
    quantity: [null as number | null, [Validators.required, Validators.min(1)]]
  });

  board: MarketBoardViewModel = this.emptyBoard();
  pendingOrders: OrderStatusView[] = [];
  loading = false;
  commandInProgress = false;
  sessionStarting = false;
  errorMessage = '';
  commandMessage = '';
  commandSuccess = false;
  sessionState = 'Chưa khởi động';
  realtimeState: RealtimeConnectionState = 'disconnected';

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly exchangeApi: ExchangeApiService,
    private readonly realtime: ExchangeRealtimeService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.exchangeApi.getInstruments().pipe(
      catchError(() => {
        this.errorMessage = 'Không tải được danh sách instrument.';
        return of(null);
      }),
      takeUntil(this.destroy$)
    ).subscribe(response => {
      this.availableInstruments = response?.isSuccess ? (response.data ?? []) : [];
      this.initSelectedSymbol();
      this.loadMarket().pipe(takeUntil(this.destroy$)).subscribe();
    });

    this.realtime.events$.pipe(takeUntil(this.destroy$)).subscribe(event => this.applyRealtimeEvent(event));
    this.realtime.connectionState$.pipe(takeUntil(this.destroy$)).subscribe(state => this.realtimeState = state);
    this.realtime.connect();
    timer(0, 2000).pipe(
      takeUntil(this.destroy$),
      switchMap(() => this.exchangeApi.getTradingSession().pipe(catchError(() => of(null))))
    ).subscribe(response => {
      if (response?.isSuccess && response.data?.state) this.sessionState = response.data.state;
    });
  }

  private initSelectedSymbol(): void {
    const urlParamSymbol = this.route.snapshot.queryParams['symbol'];
    const storedSymbol = localStorage.getItem(STORAGE_KEY);

    let symbolToUse = '';
    if (urlParamSymbol && this.isValidSymbol(urlParamSymbol)) {
      symbolToUse = urlParamSymbol.toUpperCase();
    } else if (storedSymbol && this.isValidSymbol(storedSymbol)) {
      symbolToUse = storedSymbol.toUpperCase();
    } else if (this.availableInstruments.length > 0) {
      symbolToUse = this.availableInstruments[0].symbol;
    } else {
      symbolToUse = 'FXS';
    }

    this.selectedSymbol = symbolToUse;
    localStorage.setItem(STORAGE_KEY, symbolToUse);
  }

  private isValidSymbol(symbol: string): boolean {
    if (!symbol) return false;
    if (this.availableInstruments.length === 0) return true;
    const upper = symbol.toUpperCase();
    return this.availableInstruments.some(item => item.symbol.toUpperCase() === upper);
  }

  onSymbolChange(event: Event): void {
    const newSymbol = (event.target as HTMLSelectElement).value;
    if (!newSymbol || newSymbol === this.selectedSymbol) return;

    this.selectedSymbol = newSymbol;
    localStorage.setItem(STORAGE_KEY, newSymbol);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { symbol: newSymbol },
      queryParamsHandling: 'merge'
    });
    this.loadMarket().pipe(takeUntil(this.destroy$)).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.realtime.disconnect();
  }

  startSession(): void {
    if (this.sessionStarting || this.isTradingActive) return;
    this.sessionStarting = true;
    this.errorMessage = '';
    this.exchangeApi.startTradingSession().pipe(takeUntil(this.destroy$)).subscribe({
      next: response => {
        this.sessionStarting = false;
        if (response?.isSuccess && response.data) {
          this.sessionState = response.data.state;
          this.loadMarket().pipe(takeUntil(this.destroy$)).subscribe();
        } else {
          this.errorMessage = response?.message || 'Không thể khởi động phiên giao dịch.';
        }
      },
      error: error => {
        this.sessionStarting = false;
        this.errorMessage = this.errorText(error, 'Không thể khởi động phiên giao dịch.');
      }
    });
  }

  submitOrder(): void {
    this.commandMessage = '';
    this.errorMessage = '';
    if (!this.isTradingActive) {
      this.commandSuccess = false;
      this.commandMessage = 'Hãy khởi động phiên giao dịch trước khi đặt lệnh.';
      return;
    }
    if (this.orderForm.invalid || this.commandInProgress) {
      this.orderForm.markAllAsTouched();
      return;
    }

    this.commandInProgress = true;
    const value = this.orderForm.getRawValue();
    this.exchangeApi.placeOrder({
      brokerId: value.brokerId as string,
      symbol: this.selectedSymbol,
      side: value.side as 'Buy' | 'Sell',
      price: Number(value.price),
      quantity: Number(value.quantity)
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: response => {
        if (response?.isSuccess && response.data) {
          this.handlePlaceOrder(response.data);
        } else {
          this.commandSuccess = false;
          this.commandMessage = response?.message || 'Đặt lệnh không thành công.';
        }
      },
      error: error => this.handleCommandError(error),
      complete: () => this.commandInProgress = false
    });
  }

  cancelOrder(order: OrderStatusView): void {
    if (!this.isTradingActive || this.commandInProgress) return;
    this.commandInProgress = true;
    this.commandMessage = '';
    this.exchangeApi.cancelOrder(order.orderId, order.brokerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          if (response?.isSuccess && response.data) {
            this.handleCancelOrder(response.data, order);
          } else {
            this.commandSuccess = false;
            this.commandMessage = response?.message || 'Hủy lệnh không thành công.';
          }
        },
        error: error => this.handleCommandError(error),
        complete: () => this.commandInProgress = false
      });
  }

  trackByPrice(_: number, level: PriceLevel): number {
    return level.price;
  }

  trackByTrade(_: number, trade: TradeTapeEntry): number {
    return trade.tradeId;
  }

  get isTradingActive(): boolean {
    const state = this.sessionState.toLowerCase();
    return state === 'open' || state === 'continuous';
  }

  get sessionLabel(): string {
    return this.isTradingActive ? 'Đang mở' : 'Đang đóng';
  }

  get realtimeLabel(): string {
    switch (this.realtimeState) {
      case 'connected': return 'Đã kết nối realtime';
      case 'connecting': return 'Đang kết nối realtime';
      case 'reconnecting': return 'Đang kết nối lại';
      default: return 'Mất kết nối realtime';
    }
  }

  private loadMarket(): Observable<unknown> {
    this.loading = this.board.updatedAt === null;
    return forkJoin({
      orderBook: this.exchangeApi.getOrderBook(this.selectedSymbol),
      trades: this.exchangeApi.getTrades(this.selectedSymbol)
    }).pipe(
      catchError(error => {
        this.errorMessage = this.errorText(error, 'Không thể lấy dữ liệu thị trường mới.');
        this.loading = false;
        return EMPTY;
      }),
      tap((data: any) => {
        this.board = this.toBoard(data.orderBook?.data ?? {}, data.trades?.data ?? []);
        this.errorMessage = '';
        this.loading = false;
      })
    );
  }

  private toBoard(orderBook: any, trades: TradeTapeEntry[]): MarketBoardViewModel {
    const orderedTrades = [...(trades || [])].sort((a, b) => b.executedSequence - a.executedSequence);
    return {
      symbol: orderBook.symbol || this.selectedSymbol,
      latestPrice: orderedTrades.length > 0 ? orderedTrades[0].price : null,
      bids: (orderBook.bids || []).slice(0, 5),
      asks: (orderBook.asks || []).slice(0, 5),
      pendingVolume: [...(orderBook.bids || []), ...(orderBook.asks || [])]
        .reduce((total, level) => total + Number(level.totalQuantity || 0), 0),
      trades: orderedTrades,
      asOfEventSequence: orderBook.asOfEventSequence,
      updatedAt: new Date()
    };
  }

  private handlePlaceOrder(response: PlaceOrderResponse): void {
    this.commandSuccess = response.accepted;
    this.commandMessage = response.accepted
      ? `Đặt lệnh thành công${response.orderId ? ` (#${response.orderId})` : ''}.`
      : `Lệnh bị từ chối: ${response.reason || 'Không rõ lý do.'}`;
    if (response.accepted && response.orderId) {
      const value = this.orderForm.getRawValue();
      this.pendingOrders = [{
        orderId: response.orderId,
        brokerId: value.brokerId as string,
        symbol: this.selectedSymbol,
        side: value.side as 'Buy' | 'Sell',
        price: Number(value.price),
        quantity: Number(value.quantity),
        remainingQuantity: Number(value.quantity),
        status: 'Accepted',
        sequenceNumber: 0
      }, ...this.pendingOrders];
      this.orderForm.patchValue({ price: null, quantity: null });
    }
    this.refreshAfterCommand();
  }

  private handleCancelOrder(response: CancelOrderResponse, order: OrderStatusView): void {
    this.commandSuccess = response.cancelled;
    this.commandMessage = response.cancelled
      ? `Đã hủy lệnh #${order.orderId}.`
      : `Không thể hủy lệnh: ${response.reason || 'Không rõ lý do.'}`;
    if (response.cancelled) {
      this.pendingOrders = this.pendingOrders.filter(item => item.orderId !== order.orderId);
    }
    this.refreshAfterCommand();
  }

  private refreshAfterCommand(): void {
    this.loadMarket().pipe(takeUntil(this.destroy$)).subscribe();
  }

  private applyRealtimeEvent(event: MarketEventMessage): void {
    if (event.sessionState) this.sessionState = event.sessionState;
    if (event.type === 'MARKET_SNAPSHOT' && event.orderBook) {
      this.board = this.toBoard(event.orderBook, event.trades || []);
      return;
    }
    if (event.type === 'ORDER_BOOK_CHANGED' && event.payload?.symbol) {
      this.board = this.toBoard(event.payload, this.board.trades);
    }
    if (event.type === 'TRADE_EXECUTED' && event.payload?.tradeId) {
      const trades = [event.payload, ...this.board.trades.filter(item => item.tradeId !== event.payload.tradeId)];
      this.board = this.toBoard({ ...this.board, bids: this.board.bids, asks: this.board.asks, symbol: this.board.symbol, asOfEventSequence: event.eventSequence }, trades);
    }
  }

  private handleCommandError(error: any): void {
    this.commandSuccess = false;
    this.commandMessage = this.errorText(error, 'Thao tác không thành công.');
    this.commandInProgress = false;
  }

  private errorText(error: any, fallback: string): string {
    return error?.error?.message || error?.error?.reason || error?.message || fallback;
  }

  private emptyBoard(): MarketBoardViewModel {
    return {
      symbol: this.selectedSymbol || 'FXS',
      latestPrice: null,
      bids: [],
      asks: [],
      pendingVolume: 0,
      trades: [],
      asOfEventSequence: 0,
      updatedAt: null
    };
  }
}
