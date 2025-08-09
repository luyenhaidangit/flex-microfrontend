import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { LocalStorage } from '../enums/local-storage.enum';

export interface MeProfile {
    sub?: string;
    username?: string;
    roles?: string[];
    permissions?: string[];
    // Backward compatibility fields
    id?: number | string;
    email?: string;
    firstName?: string;
    lastName?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<any>;
    public currentUser$: Observable<any>;

    // New in-memory state for token + profile
    private accessToken: string | null = null;
    private logoutTimer: any;
    private meSubject: BehaviorSubject<MeProfile | null> = new BehaviorSubject<MeProfile | null>(null);

    constructor(private http: HttpClient, private router: Router) {
        // Load user from localStorage/sessionStorage if available
        const token = this.getAuthToken();
        let user = null;
        if (token && token.user) {
            user = token.user;
        } else {
            try {
                const userStr = localStorage.getItem('currentUser');
                if (userStr) user = JSON.parse(userStr);
            } catch {}
        }
        this.currentUserSubject = new BehaviorSubject<any>(user);
        this.currentUser$ = this.currentUserSubject.asObservable();

        // Bootstrap token to in-memory + setup auto-logout
        this.bootstrapFromStorage();

        // Multi-tab sync: apply logout/login across tabs
        window.addEventListener('storage', (e: StorageEvent) => {
            if (e.key === LocalStorage.AuthToken && e.newValue === null) this.forceLogout(false);
            if (e.key === LocalStorage.AuthToken && e.newValue) this.bootstrapFromStorage();
        });
    }

    // Login
    public login(userName: string, password: string, rememberMe: boolean) {
        const body = {
            userName: userName,
            password: password,
            rememberMe: rememberMe
        };
        return this.http.post('/api/auth/login', body);
    }

    public logout() {
        this.removeAuthToken();
        this.currentUserSubject.next(null);
        localStorage.removeItem('currentUser');
        this.forceLogout(false);
    }

    // Set AuthToken
    public setAuthToken(authToken: any, rememberMe: boolean) {
        const tokenString = JSON.stringify(authToken);
        if (rememberMe) {
            localStorage.setItem(LocalStorage.AuthToken, tokenString);
        } else {
            sessionStorage.setItem(LocalStorage.AuthToken, tokenString);
        }
        // Nếu authToken có user, cập nhật luôn user hiện tại
        if (authToken && authToken.user) {
            this.setCurrentUser(authToken.user);
        }
        // Re-bootstrap token state and auto-logout timer
        this.bootstrapFromStorage();
    }

    // Get AuthToken
    public getAuthToken(): any {
        const tokenString = localStorage.getItem(LocalStorage.AuthToken) || sessionStorage.getItem(LocalStorage.AuthToken);
        if (tokenString) {
            return JSON.parse(tokenString);
        }
        return null;
    }

    // New: expose string token quickly for interceptors/guards
    public getToken(): string | null {
        if (this.accessToken) return this.accessToken;
        const stored = this.getAuthToken();
        return stored?.accessToken ?? null;
    }

    // Delete AuthToken
    private removeAuthToken() {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
    }

    // Get Current User (sync)
    public getCurrentUser(): any {
        return this.currentUserSubject.value;
    }

    // Set Current User
    public setCurrentUser(user: any): void {
        this.currentUserSubject.next(user);
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('currentUser');
        }
    }

    // Get User Profile
    public GetUserProfile() {
        return this.http.get('/api/auth/me');
    }

    // === New APIs for startup validation ===
    public getProfile$(): Observable<MeProfile | null> {
        return this.meSubject.asObservable();
    }

    public async initOnStartup(): Promise<void> {
        // Validate token with backend and load profile
        const token = this.getToken();
        if (!token) {
            this.meSubject.next(null);
            return;
        }
        try {
            const response: any = await firstValueFrom(this.http.get('/api/auth/me'));
            const profile: MeProfile | null = response?.data ?? response ?? null;
            this.meSubject.next(profile);
            if (profile) this.setCurrentUser(profile);
        } catch {
            // Token invalid/expired/revoked
            this.logout();
        }
    }

    // === Internal helpers ===
    private bootstrapFromStorage(): void {
        const stored = this.getAuthToken();
        const token: string | null = stored?.accessToken ?? null;
        if (!token) { this.forceLogout(false); return; }

        const payload = this.decode(token);
        const expMs = (payload?.exp ?? 0) * 1000;
        const now = Date.now();

        if (!payload || now >= expMs) { this.forceLogout(true); return; }

        this.accessToken = token;

        // Auto-logout ~30s before expiry
        if (this.logoutTimer) clearTimeout(this.logoutTimer);
        this.logoutTimer = setTimeout(() => this.forceLogout(true), Math.max(0, expMs - now - 30000));
    }

    private forceLogout(navigate = true): void {
        this.accessToken = null;
        this.meSubject.next(null);
        if (this.logoutTimer) clearTimeout(this.logoutTimer);
        if (navigate) this.router.navigate(['/account/login']);
    }

    private decode(token: string): any | null {
        try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
    }
}

