import { Injectable, Injector } from '@angular/core';
import {
  HttpEvent, HttpHandler, HttpInterceptor as HttpSystemInterceptor,
  HttpRequest, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ToastService } from 'angular-toastify';
import { Header, HttpError } from '../enums/http.enum';
import { LoaderService } from '../services/loader.service';
import { AuthenticationService } from '../auth/auth.service';
import { ErrorMessageService } from '../services/error-message.service';

@Injectable()
export class AppHttpInterceptor implements HttpSystemInterceptor {
  private readonly apiBase = environment.apiBaseUrl.replace(/\/+$/, '');

  constructor(
    private loadingService: LoaderService,
    private toastService: ToastService,
    private injector: Injector
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let request = req;

    // Normalize URL
    if (!this.isAbsoluteUrl(request.url)) {
      request = request.clone({ url: this.joinUrl(environment.apiBaseUrl, request.url) });
    }

    // UI-only flag: consume it before sending the request to the API.
    const skipToast = request.headers.has(Header.SkipToastError);
    if (skipToast) {
      request = request.clone({ headers: request.headers.delete(Header.SkipToastError) });
    }

    // Loading indicator
    const skipLoading = request.headers.has(Header.SkipLoading);
    if (!skipLoading) {
      this.loadingService.show();
    } else {
      request = request.clone({ headers: request.headers.delete(Header.SkipLoading) });
    }

    // Authorization Bearer
    const skipAuth = request.headers.has(Header.SkipAuth);
    if (skipAuth) {
      request = request.clone({ headers: request.headers.delete(Header.SkipAuth) });
    } else if (this.isSameApi(request.url)) {
      const authService = this.injector.get(AuthenticationService);
      const bearerToken = authService.getToken();
      if (bearerToken) {
        request = request.clone({
          setHeaders: { Authorization: `Bearer ${bearerToken}` }
        });
      }
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Error handling
        // Skip toast for requests that opt out of global error notifications.
        if (!skipToast) {
          if (error.status === 0) {
            // Network/CORS error
            this.toastService.error('Không thể kết nối đến máy chủ (mạng/CORS)!');
          } else if (error.status === HttpError.ConnectionRefused) {
            this.toastService.error('Không thể kết nối đến máy chủ!');
          } else {
            const errorMessage = this.injector.get(ErrorMessageService).getErrorMessage(error);
            this.toastService.error(errorMessage);
          }
        }

        // Auto logout when 401
        const isLogoutRequest = request.url.includes('/api/auth/logout');
        if (error.status === 401 && !isLogoutRequest) {
          // Delegate cleanup + navigation to AuthenticationService
          this.injector.get(AuthenticationService).logout();
        }

        return throwError(() => error);
      }),
      finalize(() => {
        if (!skipLoading) this.loadingService.hide();
      })
    );
  }

  // ==== Helpers ====
  private isAbsoluteUrl(url: string): boolean {
    return /^https?:\/\//i.test(url);
  }

  private isSameApi(url: string): boolean {
    // Chỉ gắn token nếu URL bắt đầu bằng apiBaseUrl
    return this.isAbsoluteUrl(url) && url.startsWith(this.apiBase);
  }

  private joinUrl(base: string, path: string): string {
    if (!base) return path;
    const b = base.replace(/\/+$/, '');
    const p = path.replace(/^\/+/, '');
    return `${b}/${p}`;
  }
}
