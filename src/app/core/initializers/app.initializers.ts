import { lastValueFrom } from 'rxjs';
import { ConfigService } from '../services/config.service';
import { AuthenticationService } from '../services/auth.service';

// Load config (auth mode) first, then validate token via /auth/me
export function appInitializerFactory(configService: ConfigService, authService: AuthenticationService): () => Promise<void> {
    return async () => {
        await lastValueFrom(configService.loadAuthMode());
        await authService.initOnStartup();
    };
}
