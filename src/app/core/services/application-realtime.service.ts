import { Injectable, NgZone } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
} from '@microsoft/signalr';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthenticationService } from './auth.service';

export type RealtimeConnectionState = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

export interface DemoChatMessage {
  type: string;
  message: string;
  occurredAt: string;
}

export interface DemoNotification {
  type: string;
  message: string;
  occurredAt: string;
}

@Injectable({ providedIn: 'root' })
export class ApplicationRealtimeService {
  private readonly messageSubject = new Subject<DemoChatMessage>();
  readonly messages$ = this.messageSubject.asObservable();
  private readonly notificationSubject = new Subject<DemoNotification>();
  readonly notifications$ = this.notificationSubject.asObservable();
  private readonly connectionStateSubject = new BehaviorSubject<RealtimeConnectionState>('disconnected');
  readonly connectionState$ = this.connectionStateSubject.asObservable();
  private connection?: HubConnection;

  constructor(
    private readonly zone: NgZone,
    private readonly authenticationService: AuthenticationService,
  ) {}

  connect(): void {
    if (this.connection && this.connection.state !== HubConnectionState.Disconnected) return;

    this.connectionStateSubject.next('connecting');
    this.connection = new HubConnectionBuilder()
      .withUrl(this.getHubUrl(), {
        accessTokenFactory: () => this.authenticationService.getToken() ?? '',
      })
      .withAutomaticReconnect([0, 1000, 3000, 5000])
      .build();

    this.connection.on('messageReceived', message => this.zone.run(() => {
      this.messageSubject.next(message as DemoChatMessage);
    }));
    this.connection.on('demoNotification', notification => this.zone.run(() => {
      this.notificationSubject.next(notification as DemoNotification);
    }));
    this.connection.onreconnecting(() => this.zone.run(() => this.connectionStateSubject.next('reconnecting')));
    this.connection.onreconnected(() => this.zone.run(() => this.connectionStateSubject.next('connected')));
    this.connection.onclose(() => this.zone.run(() => {
      this.connectionStateSubject.next('disconnected');
      this.connection = undefined;
    }));

    void this.connection.start()
      .then(() => this.zone.run(() => this.connectionStateSubject.next('connected')))
      .catch(() => this.zone.run(() => this.connectionStateSubject.next('disconnected')));
  }

  disconnect(): void {
    void this.connection?.stop();
    this.connection = undefined;
    this.connectionStateSubject.next('disconnected');
  }

  async sendMessage(message: string): Promise<void> {
    const normalizedMessage = message.trim();
    if (!normalizedMessage || !this.connection || this.connection.state !== HubConnectionState.Connected) {
      return;
    }

    await this.connection.invoke('SendMessage', normalizedMessage);
  }

  private getHubUrl(): string {
    const baseUrl = environment.agentApiBaseUrl.replace(/\/+$/, '');
    return `${baseUrl}${environment.agentRealtimeHubPath}`;
  }
}
