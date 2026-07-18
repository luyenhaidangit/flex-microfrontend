import { Injectable, NgZone } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState, HttpTransportType } from '@microsoft/signalr';
import { Subject } from 'rxjs';
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

@Injectable({ providedIn: 'root' })
export class ExchangeRealtimeService {
  private readonly eventsSubject = new Subject<MarketEventMessage>();
  readonly events$ = this.eventsSubject.asObservable();
  private connection?: HubConnection;
  private readonly hubUrl = `${environment.exchangeApiBaseUrl.replace(/\/+$/, '')}/hubs/market`;

  constructor(private readonly zone: NgZone) {}

  connect(): void {
    if (this.connection && this.connection.state !== HubConnectionState.Disconnected) return;
    this.connection = new HubConnectionBuilder()
      .withUrl(this.hubUrl, { skipNegotiation: true, transport: HttpTransportType.WebSockets })
      .withAutomaticReconnect([0, 1000, 3000, 5000])
      .build();
    this.connection.on('marketEvent', event => this.zone.run(() => this.eventsSubject.next(event as MarketEventMessage)));
    void this.connection.start().catch(() => undefined);
  }

  disconnect(): void {
    void this.connection?.stop();
    this.connection = undefined;
  }
}
