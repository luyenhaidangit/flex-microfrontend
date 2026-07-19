import { Injectable, NgZone } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { MarketBoardViewModel, OrderBookSnapshot, TradeTapeEntry } from './exchange.models';

export interface MarketEventMessage {
  type: string;
  sessionId?: string;
  sessionState?: string;
  symbol: string;
  orderBook?: OrderBookSnapshot;
  trades?: TradeTapeEntry[];
  payload?: any;
  eventSequence: number;
  occurredAt: string;
}

export type RealtimeConnectionState = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

@Injectable({ providedIn: 'root' })
export class ExchangeRealtimeService {
  private readonly eventsSubject = new Subject<MarketEventMessage>();
  readonly events$ = this.eventsSubject.asObservable();
  private readonly connectionStateSubject = new BehaviorSubject<RealtimeConnectionState>('disconnected');
  readonly connectionState$ = this.connectionStateSubject.asObservable();
  private connection?: HubConnection;
  private readonly hubUrl = `${environment.exchangeApiBaseUrl.replace(/\/+$/, '')}/hubs/market`;

  constructor(private readonly zone: NgZone) {}

  connect(): void {
    if (this.connection && this.connection.state !== HubConnectionState.Disconnected) return;
    this.connectionStateSubject.next('connecting');
    this.connection = new HubConnectionBuilder()
      .withUrl(this.hubUrl)
      .withAutomaticReconnect([0, 1000, 3000, 5000])
      .build();
    this.connection.on('marketEvent', event => this.zone.run(() => this.eventsSubject.next(event as MarketEventMessage)));
    this.connection.onreconnecting(() => this.zone.run(() => this.connectionStateSubject.next('reconnecting')));
    this.connection.onreconnected(() => this.zone.run(() => this.connectionStateSubject.next('connected')));
    this.connection.onclose(() => this.zone.run(() => this.connectionStateSubject.next('disconnected')));
    void this.connection.start()
      .then(() => this.connectionStateSubject.next('connected'))
      .catch(() => this.connectionStateSubject.next('disconnected'));
  }

  disconnect(): void {
    void this.connection?.stop();
    this.connection = undefined;
    this.connectionStateSubject.next('disconnected');
  }
}
