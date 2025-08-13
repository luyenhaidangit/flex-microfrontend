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
  private accessToken: string | null = null;
  private logoutTimer: any;

  constructor(private http: HttpClient, private router: Router) {
    this.bootstrapFromStorage();

    // Sync đa tab
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e: StorageEvent) => {
        if (e.key !== AuthenticationService.TOKEN_KEY) return;
        if (e.newValue === null) this.forceLogout(false);
        else this.bootstrapFromStorage();
      });
    }
  }

  // ===== Public API =====
  login(userName: string, password: string, rememberMe: boolean): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/login', { userName, password, rememberMe });
  }

  logout(): void {
    this.clearTokenFromStorage();
    this.clearTimersAndState();
    this.router.navigate(['/account/login']);
  }

  /** Lấy token (cho Interceptor/Guard) */
  getToken(): string | null {
    if (this.accessToken) return this.accessToken;
    return this.readRawToken();
  }

  /** Lắng nghe profile đã xác thực */
  getProfile$(): Observable<MeProfile | null> {
    return this.meSubject.asObservable();
  }

  getCurrentUser(): MeProfile | null {
    return this.meSubject.value;
  }

  /** Gọi ở AppInitializer/AppComponent: xác thực token và nạp profile */
  async initOnStartup(): Promise<void> {
    const token = this.getToken();
    if (!token) {
      this.meSubject.next(null);
      return;
    }
    try {
      const res: any = await firstValueFrom(this.http.get('/api/auth/me'));
      const profile: MeProfile | null = res?.data ?? res ?? null;
      this.meSubject.next(profile);
      this.scheduleAutoLogoutFromToken(token);
    } catch {
      this.logout();
    }
  }

  /** Lưu token sau khi login (raw string, không bọc object) */
  setAuthToken(accessToken: string, rememberMe: boolean): void {
    if (rememberMe) {
      localStorage.setItem(AuthenticationService.TOKEN_KEY, accessToken);
      sessionStorage.removeItem(AuthenticationService.TOKEN_KEY);
    } else {
      sessionStorage.setItem(AuthenticationService.TOKEN_KEY, accessToken);
      localStorage.removeItem(AuthenticationService.TOKEN_KEY);
    }
    this.bootstrapFromStorage();
  }

  // ===== Internal =====
  private bootstrapFromStorage(): void {
    const token = this.readRawToken();
    if (!token) { this.forceLogout(false); return; }

    const payload = this.safeDecodeJwt(token);
    const expMs = (payload?.exp ?? 0) * 1000;
    const now = Date.now();
    if (!payload?.exp || now >= expMs) { this.forceLogout(true); return; }

    this.accessToken = token;
    this.schedule(expMs - now);
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
    this.clearTimersAndState();
    this.clearTokenFromStorage();
    if (navigate) this.router.navigate(['/account/login']);
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

  /**
   * Đọc token từ storage.
   * - Ưu tiên raw string (mới)
   * - Tương thích ngược JSON cũ: {"accessToken":"..."}
   */
  private readRawToken(): string | null {
    const raw = localStorage.getItem(AuthenticationService.TOKEN_KEY)
            ?? sessionStorage.getItem(AuthenticationService.TOKEN_KEY);
    if (!raw) return null;

    // Nếu là JSON cũ -> parse lấy accessToken; nếu là raw string -> trả thẳng.
    if (raw.startsWith('{')) {
      try {
        const obj = JSON.parse(raw);
        return obj?.accessToken ?? null;
      } catch {
        return null;
      }
    }
    return raw;
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