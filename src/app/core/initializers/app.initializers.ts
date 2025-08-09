import { AuthenticationService } from '../services/auth.service';

// FE không cần gọi auth mode lúc bootstrap; chỉ verify token /auth/me nếu có
export function appInitializerFactory(authService: AuthenticationService): () => Promise<void> {
    return async () => {
        await authService.initOnStartup();
    };
}
