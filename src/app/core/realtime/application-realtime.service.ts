import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthenticationLifecycleEvents } from '../auth/auth.model';
import { AuthenticationService } from '../auth/auth.service';
import { RealtimeConnection } from './realtime-connection';
import {
  ApplicationRealtimeEvents,
  ApplicationRealtimeMethods,
  DirectChatMessage,
} from './realtime-event.model';

@Injectable({ providedIn: 'root' })
export class ApplicationRealtimeService implements OnDestroy {
  private readonly directMessageSubject = new Subject<DirectChatMessage>();
  readonly directMessages$ = this.directMessageSubject.asObservable();
  readonly connectionState$ = this.realtimeConnection.connectionState$;
  private authenticationSubscription?: Subscription;

  constructor(
    private readonly realtimeConnection: RealtimeConnection,
    private readonly authenticationService: AuthenticationService,
  ) {
    this.realtimeConnection.on(ApplicationRealtimeEvents.DirectMessage, (message: DirectChatMessage) => {
      this.directMessageSubject.next(message);
    });
  }

  initialize(): void {
    if (this.authenticationSubscription) return;

    this.authenticationSubscription = this.authenticationService.authenticationLifecycle$.subscribe(event => {
      if (event === AuthenticationLifecycleEvents.Authenticated) {
        this.reconnect();
      } else {
        this.disconnect();
      }
    });
  }

  reconnect(): void {
    this.realtimeConnection.reconnect(this.getHubUrl(), () => this.authenticationService.getToken() ?? '');
  }

  disconnect(): void {
    this.realtimeConnection.disconnect();
  }

  async sendDirectMessage(recipientUserId: string, message: string): Promise<void> {
    const normalizedRecipientUserId = recipientUserId.trim();
    const normalizedMessage = message.trim();
    if (!normalizedRecipientUserId || !normalizedMessage) return;

    await this.realtimeConnection.invoke(
      ApplicationRealtimeMethods.SendDirectMessage,
      normalizedRecipientUserId,
      normalizedMessage);
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
