import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { LocalStorage } from '../enums/local-storage.enum';

export interface MeProfile {
  sub?: string;
  username?: string;
  roles?: string[];
  permissions?: string[];
  id?: number | string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginResponse {
  isSuccess: boolean;
  message?: string;
  data?: { accessToken: string } | null;
}

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private static readonly TOKEN_KEY = LocalStorage.AuthToken;
  private static readonly LOGOUT_LEEWAY_MS = 30_000;

  private meSubject = new BehaviorSubject<MeProfile | null>(null);
  public readonly me$ = this.meSubject.asObservable();

  private accessToken: string | null = null;
  private logoutTimer: any;

  constructor(private http: HttpClient, private router: Router, private injector: Injector) {
    this.bootstrapFromStorage();

    // Sync multi-tab
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e: StorageEvent) => {
        if (e.key !== AuthenticationService.TOKEN_KEY) return;
        if (e.newValue === null) {
          this.forceLogout(false);
        } else {
          this.bootstrapFromStorage(true);
        }
      });
    }
  }

  // ===== Public API =====
  login(userName: string, password: string, rememberMe: boolean): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/login', { userName, password, rememberMe });
  }

  logout(): void {
    // Call logout API first
    this.callLogoutApi().finally(() => {
      // Always clear local state regardless of API call result
      // Ensure all UI overlays are closed (modals/backdrops)
      this.clearTokenFromStorage();
      this.clearTimersAndState();
      this.router.navigate(['/account/login']);
    });
  }

  /** Lấy token (cho Interceptor/Guard) */
  getToken(): string | null {
    if (this.accessToken) return this.accessToken;
    return this.readRawToken();
  }

  /** Observable profile */
  getProfile$(): Observable<MeProfile | null> {
    return this.me$;
  }

  /** Snapshot profile */
  getCurrentUser(): MeProfile | null {
    return this.meSubject.value;
  }

  // Verify token and load profile
  async initOnStartup(): Promise<void> {
    const token = this.getToken();
    if (!token) { this.meSubject.next(null); return; }
    this.scheduleAutoLogoutFromToken(token);
    await this.refreshProfile();
  }

  // Save token after login
  setAuthToken(accessToken: string, rememberMe: boolean): void {
    if (rememberMe) {
      localStorage.setItem(AuthenticationService.TOKEN_KEY, accessToken);
      sessionStorage.removeItem(AuthenticationService.TOKEN_KEY);
    } else {
      sessionStorage.setItem(AuthenticationService.TOKEN_KEY, accessToken);
      localStorage.removeItem(AuthenticationService.TOKEN_KEY);
    }
    this.bootstrapFromStorage();
    this.refreshProfile();
  }

  // ===== Internal =====
  private async callLogoutApi(): Promise<void> {
    const token = this.getToken();
    if (!token) return; // No token to logout
    
    try {
      await firstValueFrom(this.http.post('/api/auth/logout', {}));
    } catch (error) {
      // Log error but don't prevent logout
      console.warn('Logout API call failed:', error);
    }
  }

  private bootstrapFromStorage(loadProfile = false): void {
    const token = this.readRawToken();
    if (!token) { this.forceLogout(false); return; }

    const payload = this.safeDecodeJwt(token);
    const expMs = (payload?.exp ?? 0) * 1000;
    const now = Date.now();
    if (!payload?.exp || now >= expMs) { this.forceLogout(true); return; }

    this.accessToken = token;
    this.schedule(expMs - now);

    if (loadProfile) {
      void this.refreshProfile();
    }
  }

  private scheduleAutoLogoutFromToken(token: string): void {
    const exp = this.safeDecodeJwt(token)?.exp;
    if (!exp) return;
    const expMs = exp * 1000;
    const now = Date.now();
    this.schedule(expMs - now);
  }

  private schedule(msUntilExp: number): void {
    if (this.logoutTimer) clearTimeout(this.logoutTimer);
    const fireIn = Math.max(0, msUntilExp - AuthenticationService.LOGOUT_LEEWAY_MS);
    this.logoutTimer = setTimeout(() => this.forceLogout(true), fireIn);
  }

  private forceLogout(navigate = true): void {
    // Call logout API first
    this.callLogoutApi().finally(() => {
      // Always clear local state regardless of API call result
      this.clearTimersAndState();
      this.clearTokenFromStorage();
      if (navigate) this.router.navigate(['/account/login']);
    });
  }

  private clearTimersAndState(): void {
    this.accessToken = null;
    this.meSubject.next(null);
    if (this.logoutTimer) clearTimeout(this.logoutTimer);
  }

  private clearTokenFromStorage(): void {
    localStorage.removeItem(AuthenticationService.TOKEN_KEY);
    sessionStorage.removeItem(AuthenticationService.TOKEN_KEY);
  }

  // Load profile from /api/auth/me
  private async refreshProfile(): Promise<void> {
    const token = this.getToken();
    if (!token) { this.meSubject.next(null); return; }
    try {
      const res: any = await firstValueFrom(this.http.get('/api/auth/me'));
      const profile: MeProfile | null = res?.data ?? res ?? null;
      this.meSubject.next(profile);
    } catch {
      this.logout();
    }
  }

  private readRawToken(): string | null {
    return localStorage.getItem(AuthenticationService.TOKEN_KEY)
        ?? sessionStorage.getItem(AuthenticationService.TOKEN_KEY);
  }

  private safeDecodeJwt(token: string): any | null {
    try {
      const base64 = token.split('.')[1];
      if (!base64) return null;
      return JSON.parse(atob(base64));
    } catch {
      return null;
    }
  }
}
