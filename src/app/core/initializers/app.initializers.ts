import { AuthenticationService } from '../services/auth.service';

export function appInitializerFactory(authService: AuthenticationService): () => Promise<void> {
    return async () => {
        await authService.initOnStartup();
    };
}
