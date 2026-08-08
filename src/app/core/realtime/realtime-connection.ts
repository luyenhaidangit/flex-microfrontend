import { Injectable, NgZone, OnDestroy } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
} from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { RealtimeConnectionState } from './realtime-event.model';

type RealtimeEventHandler = (...args: any[]) => void;

@Injectable({ providedIn: 'root' })
export class RealtimeConnection implements OnDestroy {
  private readonly connectionStateSubject = new BehaviorSubject<RealtimeConnectionState>('disconnected');
  readonly connectionState$ = this.connectionStateSubject.asObservable();
  private readonly eventHandlers = new Map<string, Set<RealtimeEventHandler>>();
  private connection?: HubConnection;

  constructor(private readonly zone: NgZone) {}

  get state(): HubConnectionState {
    return this.connection?.state ?? HubConnectionState.Disconnected;
  }

  on<T>(eventName: string, handler: (payload: T) => void): void {
    const wrappedHandler: RealtimeEventHandler = (...args) =>
      this.zone.run(() => handler(args[0] as T));

    const handlers = this.eventHandlers.get(eventName) ?? new Set<RealtimeEventHandler>();
    handlers.add(wrappedHandler);
    this.eventHandlers.set(eventName, handlers);
    this.connection?.on(eventName, wrappedHandler);
  }

  connect(url: string, accessTokenFactory: () => string): void {
    if (this.connection && this.state !== HubConnectionState.Disconnected) return;

    this.connectionStateSubject.next('connecting');
    const connection = new HubConnectionBuilder()
      .withUrl(url, { accessTokenFactory })
      .withAutomaticReconnect([0, 1000, 3000, 5000])
      .build();

    this.connection = connection;
    this.attachEventHandlers(connection);
    connection.onreconnecting(() => this.updateState('reconnecting', connection));
    connection.onreconnected(() => this.updateState('connected', connection));
    connection.onclose(() => {
      if (this.connection !== connection) return;
      this.connection = undefined;
      this.updateState('disconnected', connection);
    });

    void connection.start()
      .then(() => this.updateState('connected', connection))
      .catch(() => this.updateState('disconnected', connection));
  }

  refresh(url: string, accessTokenFactory: () => string): void {
    if (!this.connection) {
      this.connect(url, accessTokenFactory);
      return;
    }

    const previousConnection = this.connection;
    this.connection = undefined;
    void previousConnection.stop().finally(() => this.connect(url, accessTokenFactory));
  }

  disconnect(): void {
    const connection = this.connection;
    this.connection = undefined;
    void connection?.stop();
    this.connectionStateSubject.next('disconnected');
  }

  invoke(methodName: string, ...args: any[]): Promise<void> {
    if (this.state !== HubConnectionState.Connected || !this.connection) {
      return Promise.resolve();
    }

    return this.connection.invoke(methodName, ...args);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  private attachEventHandlers(connection: HubConnection): void {
    this.eventHandlers.forEach((handlers, eventName) => {
      handlers.forEach(handler => connection.on(eventName, handler));
    });
  }

  private updateState(state: RealtimeConnectionState, connection: HubConnection): void {
    if (this.connection !== connection && state !== 'disconnected') return;
    this.zone.run(() => this.connectionStateSubject.next(state));
  }
}
