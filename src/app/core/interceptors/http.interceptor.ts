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
import { AuthenticationService } from '../services/auth.service';
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
        if (error.status === 0) {
          // Network/CORS error
          this.toastService.error('Không thể kết nối đến máy chủ (mạng/CORS)!');
        } else if (error.status === HttpError.ConnectionRefused) {
          this.toastService.error('Không thể kết nối đến máy chủ!');
        } else {
          // Skip toast for requests with SkipToastError header
          const skipToast = request.headers.has(Header.SkipToastError);
          if (!skipToast) {
            // Nếu có errorCode, sử dụng translation, nếu không thì dùng message như cũ
            if (error?.error?.errorCode) {
              const errorMessage = this.injector.get(ErrorMessageService).getErrorMessage(error);
              this.toastService.error(errorMessage);
            } else {
              const msg = error?.error?.message || error?.message || 'Đã xảy ra lỗi!';
              this.toastService.error(msg);
            }
          }
        }

        // Auto logout when 401
        if (error.status === 401) {
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
