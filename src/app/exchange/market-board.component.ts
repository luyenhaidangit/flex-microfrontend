import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { EMPTY, Observable, Subject, forkJoin, timer } from 'rxjs';
import { catchError, exhaustMap, takeUntil, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ExchangeApiService } from './exchange-api.service';
import {
  CancelOrderResponse,
  DemoBrokerOption,
  MarketBoardViewModel,
  OrderStatusView,
  PlaceOrderResponse,
  PriceLevel,
  TradeTapeEntry
} from './exchange.models';

@Component({
  selector: 'app-market-board',
  templateUrl: './market-board.component.html',
  styleUrls: ['./market-board.component.scss']
})
export class MarketBoardComponent implements OnInit, OnDestroy {
  readonly symbol = 'FXS';
  readonly brokers: DemoBrokerOption[] = environment.demoBrokers;
  readonly pollingIntervalMs = environment.marketBoardPollingIntervalMs;
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
  errorMessage = '';
  commandMessage = '';
  commandSuccess = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly exchangeApi: ExchangeApiService
  ) {}

  ngOnInit(): void {
    timer(0, this.pollingIntervalMs).pipe(
      takeUntil(this.destroy$),
      exhaustMap(() => this.loadMarket())
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  submitOrder(): void {
    this.commandMessage = '';
    this.errorMessage = '';
    if (this.orderForm.invalid || this.commandInProgress) {
      this.orderForm.markAllAsTouched();
      return;
    }

    this.commandInProgress = true;
    const value = this.orderForm.getRawValue();
    this.exchangeApi.placeOrder({
      brokerId: value.brokerId as string,
      symbol: this.symbol,
      side: value.side as 'Buy' | 'Sell',
      price: Number(value.price),
      quantity: Number(value.quantity)
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: response => this.handlePlaceOrder(response),
      error: error => this.handleCommandError(error),
      complete: () => this.commandInProgress = false
    });
  }

  cancelOrder(order: OrderStatusView): void {
    if (this.commandInProgress) return;
    this.commandInProgress = true;
    this.commandMessage = '';
    this.exchangeApi.cancelOrder(order.orderId, order.brokerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => this.handleCancelOrder(response, order),
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

  private loadMarket(): Observable<unknown> {
    this.loading = this.board.updatedAt === null;
    return forkJoin({
      orderBook: this.exchangeApi.getOrderBook(),
      trades: this.exchangeApi.getTrades()
    }).pipe(
      catchError(error => {
        this.errorMessage = this.errorText(error, 'Không thể lấy dữ liệu thị trường mới.');
        this.loading = false;
        return EMPTY;
      }),
      tap((data: any) => {
        this.board = this.toBoard(data.orderBook, data.trades);
        this.errorMessage = '';
        this.loading = false;
      })
    );
  }

  private toBoard(orderBook: any, trades: TradeTapeEntry[]): MarketBoardViewModel {
    const orderedTrades = [...(trades || [])].sort((a, b) => b.executedSequence - a.executedSequence);
    return {
      symbol: orderBook.symbol,
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
        symbol: this.symbol,
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
      symbol: this.symbol,
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
