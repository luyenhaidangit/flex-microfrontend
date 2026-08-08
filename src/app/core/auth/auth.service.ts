import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, firstValueFrom } from 'rxjs';
import { Header } from '../enums/http.enum';
import { AUTH_LOGOUT_LEEWAY_MS, AUTH_TOKEN_STORAGE_KEY } from './auth.constants';
import {
  AuthenticationLifecycleEvent,
  AuthenticationLifecycleEvents,
  LoginResponse,
  MeProfile,
} from './auth.model';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private meSubject = new BehaviorSubject<MeProfile | null>(null);
  public readonly me$ = this.meSubject.asObservable();
  private readonly authenticationLifecycleSubject = new Subject<AuthenticationLifecycleEvent>();
  public readonly authenticationLifecycle$ = this.authenticationLifecycleSubject.asObservable();
  private accessToken: string | null = null;
  private logoutTimer: any;
  private isLoggingOut = false;

  constructor(private http: HttpClient, private router: Router) {
    this.bootstrapFromStorage();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e: StorageEvent) => {
        if (e.key !== AUTH_TOKEN_STORAGE_KEY) return;
        if (e.newValue === null) this.forceLogout(false);
        else this.bootstrapFromStorage(true);
      });
    }
  }

  login(userName: string, password: string, rememberMe: boolean): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/login', { userName, password, rememberMe });
  }

  logout(): void {
    if (this.isLoggingOut) return;
    this.isLoggingOut = true;
    this.authenticationLifecycleSubject.next(AuthenticationLifecycleEvents.LoggedOut);
    this.callLogoutApi().finally(() => {
      this.clearTokenFromStorage();
      this.clearTimersAndState();
      this.isLoggingOut = false;
      this.router.navigate(['/account/login']);
    });
  }

  getToken(): string | null {
    return this.accessToken ?? this.readRawToken();
  }

  getProfile$(): Observable<MeProfile | null> { return this.me$; }

  getCurrentUser(): MeProfile | null { return this.meSubject.value; }

  async initOnStartup(): Promise<void> {
    const token = this.getToken();
    if (!token) { this.meSubject.next(null); return; }
    this.scheduleAutoLogoutFromToken(token);
    this.authenticationLifecycleSubject.next(AuthenticationLifecycleEvents.Authenticated);
    await this.refreshProfile();
  }

  setAuthToken(accessToken: string, rememberMe: boolean): void {
    if (rememberMe) {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, accessToken);
      sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    } else {
      sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, accessToken);
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    }
    this.bootstrapFromStorage();
    this.authenticationLifecycleSubject.next(AuthenticationLifecycleEvents.Authenticated);
    this.refreshProfile();
  }

  private async callLogoutApi(): Promise<void> {
    const token = this.getToken();
    if (!token) return;
    try {
      const headers = new HttpHeaders().set(Header.SkipAuth, 'true');
      await firstValueFrom(this.http.post('/api/auth/logout', {}, { headers }));
    } catch (error) {
      console.warn('Logout API call failed:', error);
    }
  }

  private bootstrapFromStorage(loadProfile = false): void {
    const token = this.readRawToken();
    if (!token) { this.forceLogout(false); return; }
    const payload = this.safeDecodeJwt(token);
    const expMs = (payload?.exp ?? 0) * 1000;
    if (!payload?.exp || Date.now() >= expMs) { this.forceLogout(true); return; }
    this.accessToken = token;
    this.schedule(expMs - Date.now());
    if (loadProfile) void this.refreshProfile();
  }

  private scheduleAutoLogoutFromToken(token: string): void {
    const exp = this.safeDecodeJwt(token)?.exp;
    if (exp) this.schedule(exp * 1000 - Date.now());
  }

  private schedule(msUntilExp: number): void {
    if (this.logoutTimer) clearTimeout(this.logoutTimer);
    const fireIn = Math.max(0, msUntilExp - AUTH_LOGOUT_LEEWAY_MS);
    this.logoutTimer = setTimeout(() => this.forceLogout(true), fireIn);
  }

  private forceLogout(navigate = true): void {
    if (this.isLoggingOut) return;
    this.isLoggingOut = true;
    this.authenticationLifecycleSubject.next(AuthenticationLifecycleEvents.LoggedOut);
    this.callLogoutApi().finally(() => {
      this.clearTimersAndState();
      this.clearTokenFromStorage();
      this.isLoggingOut = false;
      if (navigate) this.router.navigate(['/account/login']);
    });
  }

  private clearTimersAndState(): void {
    this.accessToken = null;
    this.meSubject.next(null);
    if (this.logoutTimer) clearTimeout(this.logoutTimer);
  }

  private clearTokenFromStorage(): void {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  }

  private async refreshProfile(): Promise<void> {
    const token = this.getToken();
    if (!token) { this.meSubject.next(null); return; }
    try {
      const res: any = await firstValueFrom(this.http.get('/api/auth/me'));
      this.meSubject.next(res?.data ?? res ?? null);
    } catch {
      this.logout();
    }
  }

  private readRawToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
      ?? sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  }

  private safeDecodeJwt(token: string): any | null {
    try {
      const base64 = token.split('.')[1];
      return base64 ? JSON.parse(atob(base64)) : null;
    } catch {
      return null;
    }
  }
}
