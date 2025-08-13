import { Injectable } from '@angular/core';
import { AuthenticationService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AppInitializerService {
  constructor(private authService: AuthenticationService) {}

  async init(): Promise<void> {
    await this.authService.initOnStartup();
  }
}
