import { lastValueFrom } from 'rxjs';
import { ConfigService } from '../services/config.service';

export function appInitializerFactory(configService: ConfigService): () => Promise<void> {
    return () => lastValueFrom(configService.loadAuthMode());
}
