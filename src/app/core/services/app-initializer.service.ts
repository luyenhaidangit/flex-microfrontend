import { Injectable } from '@angular/core';
import { AuthenticationService } from '../services/auth.service';
import { ApplicationRealtimeService } from '../realtime/application-realtime.service';

@Injectable({ providedIn: 'root' })
export class AppInitializerService {
  constructor(
    private authService: AuthenticationService,
    private applicationRealtimeService: ApplicationRealtimeService,
  ) {}

  async init(): Promise<void> {
    this.applicationRealtimeService.initialize();
    await this.authService.initOnStartup();
  }
}
