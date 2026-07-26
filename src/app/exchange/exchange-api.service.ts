import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Header } from '../core/enums/http.enum';
import { ApiResponse } from '../core/models/api.models';
import {
  CancelOrderResponse,
  InstrumentItemView,
  MarketView,
  OrderBookSnapshot,
  OrderStatusView,
  PlaceOrderRequest,
  PlaceOrderResponse,
  TradeTapeEntry,
  SessionView,
} from './exchange.models';

@Injectable({ providedIn: 'root' })
export class ExchangeApiService {
  private readonly baseUrl = environment.exchangeApiBaseUrl.replace(/\/+$/, '');

  constructor(private readonly http: HttpClient) {}

  getInstruments(): Observable<ApiResponse<InstrumentItemView[]>> {
    return this.http.get<ApiResponse<InstrumentItemView[]>>(`${this.baseUrl}/api/instruments`);
  }

  getMarkets(): Observable<ApiResponse<MarketView[]>> {
    return this.http.get<ApiResponse<MarketView[]>>(`${this.baseUrl}/api/v1/markets`);
  }

  getOrderBook(symbol?: string): Observable<ApiResponse<OrderBookSnapshot>> {
    const params = symbol ? { symbol } : {};
    return this.http.get<ApiResponse<OrderBookSnapshot>>(`${this.baseUrl}/api/orderbook`, { params });
  }

  getTrades(symbol?: string): Observable<ApiResponse<TradeTapeEntry[]>> {
    const params = symbol ? { symbol } : {};
    return this.http.get<ApiResponse<TradeTapeEntry[]>>(`${this.baseUrl}/api/trades`, { params });
  }

  startSession(market: string): Observable<ApiResponse<SessionView>> {
    return this.http.post<ApiResponse<SessionView>>(`${this.baseUrl}/api/session/start`, null, {
      params: { market },
      headers: this.commandHeaders()
    });
  }

  getSession(market: string): Observable<ApiResponse<SessionView>> {
    return this.http.get<ApiResponse<SessionView>>(`${this.baseUrl}/api/session`, { params: { market } });
  }

  startTradingSession(market: string): Observable<ApiResponse<SessionView>> {
    return this.startSession(market);
  }

  getTradingSession(market: string): Observable<ApiResponse<SessionView>> {
    return this.getSession(market);
  }

  placeOrder(request: PlaceOrderRequest): Observable<ApiResponse<PlaceOrderResponse>> {
    return this.http.post<ApiResponse<PlaceOrderResponse>>(`${this.baseUrl}/api/orders`, request, {
      headers: this.commandHeaders()
    });
  }

  getOrder(orderId: number, brokerId: string): Observable<ApiResponse<OrderStatusView>> {
    return this.http.get<ApiResponse<OrderStatusView>>(`${this.baseUrl}/api/orders/${orderId}`, {
      params: { brokerId }
    });
  }

  cancelOrder(orderId: number, brokerId: string): Observable<ApiResponse<CancelOrderResponse>> {
    return this.http.delete<ApiResponse<CancelOrderResponse>>(`${this.baseUrl}/api/orders/${orderId}`, {
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
