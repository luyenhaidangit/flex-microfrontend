import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Header } from '../core/enums/http.enum';
import {
  CancelOrderResponse,
  OrderBookSnapshot,
  OrderStatusView,
  PlaceOrderRequest,
  PlaceOrderResponse,
  TradeTapeEntry
} from './exchange.models';

export interface TradingSessionView {
  sessionId: string;
  symbol: string;
  state: string;
  startedAt: string;
  continuousStartedAt?: string;
  closedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ExchangeApiService {
  private readonly baseUrl = environment.exchangeApiBaseUrl.replace(/\/+$/, '');

  constructor(private readonly http: HttpClient) {}

  getOrderBook(): Observable<OrderBookSnapshot> {
    return this.http.get<OrderBookSnapshot>(`${this.baseUrl}/api/orderbook`);
  }

  getTrades(): Observable<TradeTapeEntry[]> {
    return this.http.get<TradeTapeEntry[]>(`${this.baseUrl}/api/trades`);
  }

  startTradingSession(): Observable<TradingSessionView> {
    return this.http.post<TradingSessionView>(`${this.baseUrl}/api/trading-session/start`, null, {
      headers: this.commandHeaders()
    });
  }

  placeOrder(request: PlaceOrderRequest): Observable<PlaceOrderResponse> {
    return this.http.post<PlaceOrderResponse>(`${this.baseUrl}/api/orders`, request, {
      headers: this.commandHeaders()
    });
  }

  getOrder(orderId: number, brokerId: string): Observable<OrderStatusView> {
    return this.http.get<OrderStatusView>(`${this.baseUrl}/api/orders/${orderId}`, {
      params: { brokerId }
    });
  }

  cancelOrder(orderId: number, brokerId: string): Observable<CancelOrderResponse> {
    return this.http.delete<CancelOrderResponse>(`${this.baseUrl}/api/orders/${orderId}`, {
      params: { brokerId },
      headers: this.commandHeaders()
    });
  }

  private commandHeaders(): HttpHeaders {
    const correlationId = this.createCorrelationId();
    return new HttpHeaders({
      [Header.CorrelationId]: correlationId,
      [Header.SkipAuth]: 'true'
    });
  }

  private createCorrelationId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `ui-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}
