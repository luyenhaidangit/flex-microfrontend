import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthenticationService } from '../auth/auth.service';
import { RealtimeConnection } from './realtime-connection';
import {
  ApplicationRealtimeEvents,
  ApplicationRealtimeMethods,
  DemoChatMessage,
  DemoNotification,
} from './realtime-event.model';

@Injectable({ providedIn: 'root' })
export class ApplicationRealtimeService implements OnDestroy {
  private readonly messageSubject = new Subject<DemoChatMessage>();
  readonly messages$ = this.messageSubject.asObservable();
  private readonly notificationSubject = new Subject<DemoNotification>();
  readonly notifications$ = this.notificationSubject.asObservable();
  readonly connectionState$ = this.realtimeConnection.connectionState$;
  private authenticationSubscription?: Subscription;

  constructor(
    private readonly realtimeConnection: RealtimeConnection,
    private readonly authenticationService: AuthenticationService,
  ) {
    this.realtimeConnection.on(ApplicationRealtimeEvents.MessageReceived, (message: DemoChatMessage) => {
      this.messageSubject.next(message);
    });
    this.realtimeConnection.on(ApplicationRealtimeEvents.DemoNotification, (notification: DemoNotification) => {
      this.notificationSubject.next(notification);
    });
  }

  initialize(): void {
    if (this.authenticationSubscription) return;

    this.authenticationSubscription = this.authenticationService.authenticationLifecycle$.subscribe(event => {
      if (event === 'authenticated') {
        this.refreshAuthentication();
      } else {
        this.disconnect();
      }
    });
  }

  refreshAuthentication(): void {
    this.realtimeConnection.refresh(this.getHubUrl(), () => this.authenticationService.getToken() ?? '');
  }

  disconnect(): void {
    this.realtimeConnection.disconnect();
  }

  async sendMessage(message: string): Promise<void> {
    const normalizedMessage = message.trim();
    if (!normalizedMessage) return;

    await this.realtimeConnection.invoke(ApplicationRealtimeMethods.SendMessage, normalizedMessage);
  }

  ngOnDestroy(): void {
    this.authenticationSubscription?.unsubscribe();
    this.disconnect();
  }

  private getHubUrl(): string {
    const baseUrl = environment.agentApiBaseUrl.replace(/\/+$/, '');
    return `${baseUrl}${environment.agentRealtimeHubPath}`;
  }
}
