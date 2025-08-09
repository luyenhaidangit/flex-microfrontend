import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor as HttpSystemInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { ToastService } from 'angular-toastify';

import { Header, HttpError } from '../enums/http.enum';
import { LoaderService } from '../services/loader.service';
import { AuthenticationService } from '../services/auth.service';

@Injectable()
export class HttpInterceptor implements HttpSystemInterceptor {
  constructor(private loadingService: LoaderService, private toastService: ToastService, private authService: AuthenticationService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Set default baseurl
    if (!request.url.startsWith('http') && !request.url.startsWith('https')) {
      request = request.clone({ url: `${environment.apiBaseUrl}${request.url}` });
    }

    // Loading when call request
    if (!request.headers.has(Header.SkipLoading)) {
      this.loadingService.show();
    } else {
      request = request.clone({
        headers: request.headers.delete(Header.SkipLoading)
      });
    }

    // Set token header
    const bearerToken = this.authService.getToken();
    if (bearerToken) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${bearerToken}`,
        }
      });
    }
    
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle case errors
        if (error.status === HttpError.ConnectionRefused) {
          this.toastService.error('Không thể kết nối đến máy chủ!');
        }

        // Auto logout on 401
        if (error.status === 401) {
          this.authService.logout();
        }

        return throwError(() => error);
      }),
      finalize(() => {
        this.loadingService.hide();
      })
    );
  }
}
